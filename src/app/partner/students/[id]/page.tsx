'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import StudentDetailsWrapper from '@/components/students/StudentDetailsWrapper';

const PartnerStudentDetailsPage = () => {
  const params = useParams();
  const studentId = params.id as string;

  return <StudentDetailsWrapper studentId={studentId} isAdmin={false} />;
};

export default PartnerStudentDetailsPage;