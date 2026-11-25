import React from 'react';
import { Link } from 'react-router';
import PageTitle from '../components/PageTitle.jsx';

export default function NotFound() {
  return <>
    <PageTitle title="페이지를 찾을 수 없습니다" />
    <Link to="/">대시보드로 돌아가기</Link>
  </>;
}
