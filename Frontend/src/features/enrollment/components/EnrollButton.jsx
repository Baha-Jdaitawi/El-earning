import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { enroll, fetchEnrollmentStatus } from '../../../store/slices/enrollmentSlice.js';
import { useState } from 'react';
import Button from '../../../shared/components/Button.jsx';

const EnrollButton = ({ courseId, className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { status } = useSelector((state) => state.enrollment);
  const [loading, setLoading] = useState(false);

  const enrolled = status?.enrolled || false;

  const handleClick = async () => {
    if (!user) return navigate('/login');
    if (enrolled) return navigate(`/learn/${courseId}`);

    setLoading(true);
    const result = await dispatch(enroll(parseInt(courseId)));
    setLoading(false);

    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(fetchEnrollmentStatus(parseInt(courseId)));
      navigate(`/learn/${courseId}`);
    }
  };

  return (
    <Button
      onClick={handleClick}
      loading={loading}
      className={`w-full ${className}`}
    >
      {enrolled ? 'Continue Learning' : 'Enroll Now'}
    </Button>
  );
};

export default EnrollButton;