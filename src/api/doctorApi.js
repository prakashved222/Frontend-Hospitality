import axios from 'axios';

// Fix the API URL to include /api/ path segment
const API_URL = 'https://hospitality-management-1h5k.onrender.com/api/doctors';
// Alternatively, use environment variable:
// const API_URL = `${import.meta.env.VITE_API_URL}/doctors`;

// Function to get configuration with auth token
const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userInfo.token}`
    }
  };
};

// Get doctor profile with better error handling
export const getDoctorProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor profile:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Handle unauthorized error - maybe redirect to login
      console.log('Auth token expired or invalid. Redirecting to login...');
      localStorage.removeItem('userInfo');
      window.location.href = '/doctor';
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

// Update doctor profile
export const updateDoctorProfile = async (doctorData) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, doctorData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update profile';
  }
};

// Get doctor appointments
export const getDoctorAppointments = async () => {
  try {
    const response = await axios.get(`${API_URL}/appointments`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch appointments';
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await axios.put(`${API_URL}/appointment/status`, {
      appointmentId,
      status
    }, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update appointment status';
  }
};

// Add prescription
export const addPrescription = async (appointmentId, prescriptionData) => {
  try {
    const response = await axios.post(`${API_URL}/appointment/prescription`, {
      appointmentId,
      ...prescriptionData
    }, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to add prescription';
  }
};


// Get doctors by department (no auth required)
export const getDoctorsByDepartment = async (department) => {
  try {
    // This function specifically needs fixing
    const response = await axios.get(`${API_URL}/department/${department}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || `Failed to fetch ${department} doctors`;
  }
};

// Get doctor patients
export const getDoctorPatients = async () => {
  try {
    // Fix the URL to correctly point to the doctor/patients endpoint
    const response = await axios.get(`${API_URL}/patients`, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    throw new Error('Failed to fetch patients');
  }
};

// Refer patient to another doctor
export const referPatientToDoctor = async (patientId, doctorId, notes) => {
  try {
    const response = await axios.post(`${API_URL}/refer`, {
      patientId,
      doctorId,
      notes
    }, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error referring patient:', error);
    throw error.response?.data?.error || 'Failed to refer patient';
  }
};

// Get received referrals with better error handling
export const getReceivedReferrals = async () => {
  try {
    const response = await axios.get(`${API_URL}/referrals/received`, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching received referrals:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch referrals');
  }
};

// Get all doctors
export const getAllDoctors = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    throw new Error('Failed to fetch doctors list');
  }
};

// Get doctor reports/analytics
export const getDoctorReports = async (reportType = 'all', timeRange = 'month') => {
  try {
    const response = await axios.get(
      `${API_URL}/reports?type=${reportType}&timeRange=${timeRange}`, 
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw new Error('Failed to load report data');
  }
};