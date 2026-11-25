import React from 'react';
import { Link } from 'react-router';
import { academic, courses } from '../data/sample.js';
import PageTitle from '../components/PageTitle.jsx';
import ProfileStrip from '../components/ProfileStrip.jsx';
import CreditTable from '../components/CreditTable.jsx';

export default function Dashboard({ draft }) {
  return <>
    <PageTitle title="대시보드" />
    <ProfileStrip />
    <section className="callout split">
      <h2>졸업까지 필요한 내용을 확인하세요</h2>
      <Link to="/academic" className="button">학업 현황 보기 →</Link>
    </section>
    <div className="metrics">
      <div className="panel"><strong>총 취득 학점</strong><p>{academic.credits.earned}학점</p></div>
      <div className="panel"><strong>전체 부족 학점</strong><p>{academic.credits.remaining}학점</p></div>
      <div className="panel"><strong>미이수 필수 과목</strong><p>{courses.filter(course => course.missingRequired).length}과목</p></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel"><h2>영역별 이수 현황</h2><CreditTable /></section>
      <section className="panel"><h2>로드맵 초안</h2>
        <p>{draft.length ? `계획 과목 ${draft.length}개 · 저장 전 변경 있음` : '추가한 계획 과목이 없습니다.'}</p>
        <Link to="/roadmap" className="button secondary">로드맵 확인 →</Link>
      </section>
    </div>
    <Link to="/courses" className="panel shortcut">수강 교과목 살펴보기 →</Link>
  </>;
}
