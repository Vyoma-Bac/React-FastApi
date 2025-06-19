const API_BASE_URL = "http://localhost:8000";

export const apiRequest = async (endpoint, method = "GET", body = null, auth = true, isFormData = false) => {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
    console.log("hereeee");
  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
    console.log("hereeee after auth");

  const requestOptions = {
    method,
    headers,
  };

  if (body) {
    if (isFormData) {
      const formData = new URLSearchParams();
      Object.entries(body).forEach(([key, value]) => {
        formData.append(key, value);
      });
      requestOptions.body = formData;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }
    console.log("before response");
    console.log(`${API_BASE_URL}${endpoint}`, requestOptions);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
};

export const fetchTodoStats = async () => {
  return await apiRequest('/todos/data/');
};