import React, { useState } from 'react';
import { Link } from 'react-router';
import { academic, courses } from '../data/sample.js';
import PageTitle from '../components/PageTitle.jsx';
import ProfileStrip from '../components/ProfileStrip.jsx';
import CreditTable from '../components/CreditTable.jsx';

export default function Academic() {
  const [showCompleted, setShowCompleted] = useState(false);
  return <>
    <PageTitle title="학업 현황">
      <span className="badge">조회 전용</span>
      <Link to="/courses" className="button secondary">교과 추천 보기 →</Link>
    </PageTitle>
    <ProfileStrip />
    <div className="view-controls" role="group" aria-label="학업 현황 보기">
      <button type="button" aria-pressed={!showCompleted} onClick={() => setShowCompleted(false)}>졸업 요건</button>
      <button type="button" aria-pressed={showCompleted} onClick={() => setShowCompleted(true)}>이수 내역</button>
    </div>
    {showCompleted ? <section className="panel">
      <h2>이수 내역 예시</h2>
      <p>공식 이수 내역은 미제공입니다.</p>
      <ul className="records">{academic.completed.map(course => <li key={course.code}>
        <strong>{course.name}</strong><span>{course.code} · {course.credits}학점 · {course.term}</span>
      </li>)}</ul>
    </section> : <>
      <section className="panel"><h2>영역별 학점 현황</h2><CreditTable /></section>
      <section className="panel"><h2>미이수 필수 과목</h2>
        <ul className="records">{courses.filter(course => course.missingRequired).map(course =>
          <li key={course.code}><strong>{course.name}</strong><span>{course.code} · {course.credits}학점</span></li>
        )}</ul>
      </section>
    </>}
  </>;
}
