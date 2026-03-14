import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'raj.1044.priyanshu@gmail.com',
      password: 'password' // Assuming this fails, we will just use the token from db directly
    });
  } catch (err) {
    console.log("Login failed or bypassing...");
  }
}
test();
