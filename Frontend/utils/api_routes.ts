
import API_PREFIXES from "../../utils/api_routes.json"

// @ts-ignore
const BASE_URL = "http://localhost:5500";

export const API_ROUTES = {
    USERS: `${BASE_URL}${API_PREFIXES.USERS}`,
    UTILS: `${BASE_URL}${API_PREFIXES.UTILS}`,
    PROBLEM_SETS: `${BASE_URL}${API_PREFIXES.PROBLEM_SETS}`,
    ROOMS: `${BASE_URL}${API_PREFIXES.ROOMS}`,
    HISTORY: `${BASE_URL}${API_PREFIXES.HISTORY}`,
};