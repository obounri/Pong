import axios from 'axios';

const API_BASE_URL = 'http://192.168.107.95:3300';

export async function getUserById(userId: number) {
  console.log(userId, 'userId');
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      withCredentials: true,
    });
    console.log(response.data, 'response.data');
    if (response.status === 200) {
      const data = await response.data;
      return data;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user');
  }
}
