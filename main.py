from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import models
import schemas
import auth
from database import get_db, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="!secret-session-key!")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check if email exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/greet/{name}")
def greet(name: str):
    return {"greeting": f"Hello, {name}!"}

# Todo endpoints
@app.post("/todos/", response_model=schemas.TodoResponse)
async def create_todo(
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_todo = models.Todo(**todo.model_dump(), owner_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get("/todos/", response_model=List[schemas.TodoResponse])
async def read_todos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    todos = db.query(models.Todo).filter(
        models.Todo.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return todos

@app.get("/todos/data/")
async def status_todos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total = db.query(models.Todo).filter(models.Todo.owner_id == current_user.id).count()
    completed = db.query(models.Todo).filter(models.Todo.owner_id == current_user.id,
                                             models.Todo.completed == True).count()
    pending = db.query(models.Todo).filter(models.Todo.owner_id == current_user.id,
                                           models.Todo.completed == False).count()
    return {"total": total, "completed": completed, "pending": pending}


@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
async def read_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.owner_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.put("/todos/{todo_id}", response_model=schemas.TodoResponse)
async def update_todo(
    todo_id: int,
    todo_update: schemas.TodoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.owner_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.commit()
    db.refresh(todo)
    return todo

@app.delete("/todos/{todo_id}")
async def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.owner_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(todo)
    db.commit()
    return {'message': 'Task deleted successfully'}

@app.patch("/todos/{todo_id}/complete", response_model=schemas.TodoResponse)
async def toggle_todo_complete(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.owner_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo.completed = not todo.completed
    db.commit()
    db.refresh(todo)
    return todo

@app.get("/todos/search/", response_model=List[schemas.TodoResponse])
async def search_todos(
    query: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    todos = db.query(models.Todo).filter(
        models.Todo.owner_id == current_user.id,
        (models.Todo.title.ilike(f"%{query}%") | models.Todo.description.ilike(f"%{query}%"))
    ).all()
    return todos



