import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios.js';

export const fetchMyEnrollments = createAsyncThunk('enrollment/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/enrollments/my', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch enrollments');
  }
});

export const enroll = createAsyncThunk('enrollment/enroll', async (course_id, { rejectWithValue }) => {
  try {
    const res = await api.post('/enrollments', { course_id });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to enroll');
  }
});

export const unenroll = createAsyncThunk('enrollment/unenroll', async (course_id, { rejectWithValue }) => {
  try {
    await api.delete(`/enrollments/course/${course_id}`);
    return course_id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to unenroll');
  }
});

export const fetchEnrollmentStatus = createAsyncThunk('enrollment/fetchStatus', async (course_id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/enrollments/course/${course_id}/status`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch status');
  }
});

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState: {
    enrollments: [],
    status: null,
    meta: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyEnrollments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(enroll.fulfilled, (state, action) => { state.enrollments.unshift(action.payload); })

      .addCase(unenroll.fulfilled, (state, action) => {
        state.enrollments = state.enrollments.filter(e => e.course_id !== action.payload);
      })

      .addCase(fetchEnrollmentStatus.fulfilled, (state, action) => { state.status = action.payload; });
  },
});

export const { clearError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;