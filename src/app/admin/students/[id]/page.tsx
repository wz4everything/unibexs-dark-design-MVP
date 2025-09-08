'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import StudentDetailsWrapper from '@/components/students/StudentDetailsWrapper';

const AdminStudentDetailsPage = () => {
  const params = useParams();
  const studentId = params.id as string;

  return <StudentDetailsWrapper studentId={studentId} isAdmin={true} />;
};

export default AdminStudentDetailsPage;