import React from 'react';
import { Link } from 'react-router';
import { courses, profile, terms } from '../data/sample.js';
import PageTitle from '../components/PageTitle.jsx';

export default function Roadmap({ draft }) {
  return <>
    <PageTitle title="나의 로드맵">{draft.length > 0 && <span className="badge amber">저장 전 변경 있음</span>}</PageTitle>
    <section className="panel split">
      <div><strong>계획 대상 트랙</strong><p>{profile.tracks.join(' · ')}</p></div>
      <Link to="/courses" className="button secondary">교과 추가</Link>
    </section>
    <p className="callout">현재 페이지 실행 중에만 유지되는 임시 초안입니다. 새로고침하면 초기화됩니다.</p>
    <div className="term-grid">
      {terms.map(term => {
        const items = draft.filter(item => item.term === term.id).map(item => courses.find(course => course.code === item.code));
        return <section className="panel term" aria-label={term.label} key={term.id}>
          <h2>{term.label}</h2>
          <div className="term-items">
            {items.length ? <ul className="records">{items.map(course => <li key={course.code}>
              <span className="badge">교과</span><strong>{course.name}</strong>
              <span>{course.code} · {course.credits}학점</span>
            </li>)}</ul> : <p className="empty">이 학기에 추가한 과목이 없습니다.</p>}
          </div>
          <p className="term-total">계획 교과 학점 합계 · {items.reduce((sum, course) => sum + course.credits, 0)}학점</p>
        </section>;
      })}
    </div>
    <p className="callout">계획 과목은 공식 이수 내역과 취득 학점에 반영되지 않습니다.</p>
  </>;
}
