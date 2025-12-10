import axios from 'axios';

const BASE_URL = 'https://api.tvmaze.com';

// Получить список сериалов
export const fetchShows = async (page = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/shows?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shows:', error);
    return [];
  }
};

// Получить детали сериала
export const fetchShowDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/shows/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
};

// Поиск сериалов
export const searchShows = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/shows?q=${query}`);
    return response.data.map(item => item.show);
  } catch (error) {
    console.error('Error searching shows:', error);
    return [];
  }
};