import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios.js';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/courses', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses');
  }
});

export const fetchCourse = createAsyncThunk('courses/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/courses/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch course');
  }
});

export const createCourse = createAsyncThunk('courses/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/courses', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create course');
  }
});

export const updateCourse = createAsyncThunk('courses/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/courses/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update course');
  }
});

export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/courses/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete course');
  }
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    course: null,
    meta: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCourse: (state) => { state.course = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchCourse.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourse.fulfilled, (state, action) => { state.loading = false; state.course = action.payload; })
      .addCase(fetchCourse.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createCourse.fulfilled, (state, action) => { state.courses.unshift(action.payload); })

      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.courses[index] = action.payload;
        if (state.course?.id === action.payload.id) state.course = action.payload;
      })

      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError, clearCourse } = coursesSlice.actions;
export default coursesSlice.reducer;