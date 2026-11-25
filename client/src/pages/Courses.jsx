import React, { useEffect, useRef, useState } from 'react';
import { courses } from '../data/sample.js';
import PageTitle from '../components/PageTitle.jsx';
import TermDialog from '../components/TermDialog.jsx';

export default function Courses({ draft, onAdd }) {
  const [course, setCourse] = useState(null);
  const [choosing, setChoosing] = useState(false);
  const detailTitle = useRef(null);
  const detailTrigger = useRef(null);
  const addTrigger = useRef(null);
  const planned = draft.some(item => item.code === course?.code);

  useEffect(() => {
    if (course) detailTitle.current.focus();
  }, [course]);

  function closeDetail() {
    setCourse(null);
    detailTrigger.current?.focus();
  }

  return <>
    <PageTitle title="교과목" />
    <div className="view-controls"><strong>수강 추천</strong></div>
    <p className="callout">추천 근거는 시연용 예시입니다. 실제 개설 학기와 인정 영역은 확인이 필요합니다.</p>
    <div className={course ? 'course-grid detail-open' : 'course-grid'}>
      <div className="course-list">
        {courses.map(item => <article className="panel" key={item.code}>
          <div className="split">
            <h2>{item.name}</h2>
            <button type="button" className="button secondary" aria-expanded={course === item}
              aria-label={`${item.name} 상세보기`} onClick={event => {
                detailTrigger.current = event.currentTarget;
                if (course === item) detailTitle.current.focus();
                else setCourse(item);
              }}>상세보기</button>
          </div>
          <p>{item.code} · {item.credits}학점 · {item.track}</p>
          <p>인정 영역 · {item.recognition.map(entry => `${entry.track} ${entry.area}`).join(' / ')}</p>
          <p className="callout"><strong>추천 근거</strong> {item.reason}</p>
          {draft.some(entry => entry.code === item.code) && <span className="badge">이미 계획에 있음</span>}
        </article>)}
      </div>
      {course && <aside className="panel detail" aria-labelledby="detail-title" onKeyDown={event => {
        if (event.key === 'Escape' && !choosing) closeDetail();
      }}>
        <div className="split">
          <h2 tabIndex={-1} id="detail-title" ref={detailTitle}>교과목 상세</h2>
          <button type="button" className="close" aria-label="과목 상세 닫기" onClick={closeDetail}>×</button>
        </div>
        <h3>{course.name}</h3>
        <p>{course.code} · {course.credits}학점 · {course.track}</p>
        <h3>트랙별 인정 영역</h3>
        <ul>{course.recognition.map(entry => <li key={entry.track}>{entry.track} · {entry.area}</li>)}</ul>
        <h3>공식 프로파일·수업계획서</h3><p>미제공</p>
        <h3>추천 근거</h3><p className="callout">{course.reason}</p>
        <button type="button" className="button" ref={addTrigger} disabled={planned}
          onClick={() => setChoosing(true)}>계획 추가</button>
        {planned && <p role="status">이미 계획에 있는 과목입니다.</p>}
        {choosing && <TermDialog course={course} onAdd={onAdd} onCancel={() => {
          setChoosing(false);
          requestAnimationFrame(() => addTrigger.current?.focus());
        }} />}
      </aside>}
    </div>
  </>;
}
