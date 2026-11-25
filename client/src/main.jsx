import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { academic, courses, profile, terms } from './data/sample.js';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router';
import './styles.css';

const routes = [
  { path: '/', title: '대시보드', icon: '⌂' },
  { path: '/academic', title: '학업 현황', icon: '▥' },
  { path: '/courses', title: '교과목', icon: '▤' },
  { path: '/roadmap', title: '로드맵', icon: '◇' },
];

function PageTitle({ title, children }) {
  return <div className="page-title"><h1 tabIndex={-1}>{title}</h1>{children}</div>;
}

function ProfileStrip() {
  return <dl className="panel profile">
    <div><dt>학년·학기</dt><dd>{profile.year}학년 {profile.semester}학기</dd></div>
    <div><dt>입학년도</dt><dd>{profile.entryYear}년</dd></div>
    {profile.tracks.map((track, index) => <div key={track}><dt>{index + 1}트랙</dt><dd>{track}</dd></div>)}
  </dl>;
}

function CreditTable() {
  return <div className="table-scroll"><table>
    <thead><tr><th scope="col">영역</th><th scope="col">취득 학점</th><th scope="col">요구 학점</th><th scope="col">부족 학점</th></tr></thead>
    <tbody>{academic.areas.map(area => <tr key={area.name}>
      <th scope="row">{area.name}</th><td>{area.earned ?? '미제공'}</td>
      <td>{area.required ?? '미제공'}</td><td>{area.remaining ?? '미제공'}</td>
    </tr>)}</tbody>
  </table></div>;
}

function Dashboard({ draft }) {
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

function Academic() {
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

function TermDialog({ course, onCancel, onAdd }) {
  const dialog = useRef(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return <dialog ref={dialog} aria-labelledby="term-title" onCancel={event => {
    event.preventDefault();
    onCancel();
  }}>
    <form onSubmit={event => {
      event.preventDefault();
      if (term) onAdd(course.code, term);
    }}>
      <h2 id="term-title">학기 선택</h2>
      <p><strong>{course.name}</strong> · {course.code} · {course.credits}학점</p>
      <fieldset><legend>배치 학기</legend>
        {terms.map(option => <label className="term-option" key={option.id}>
          <input autoFocus={option === terms[0]} type="radio" name="term" value={option.id}
            checked={term === option.id} onChange={() => setTerm(option.id)} />
          {option.label}
        </label>)}
      </fieldset>
      <div className="actions">
        <button type="button" className="button secondary" onClick={onCancel}>취소</button>
        <button type="submit" className="button" disabled={!term}>추가</button>
      </div>
    </form>
  </dialog>;
}

function Recommendations({ draft, onAdd }) {
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

function Roadmap({ draft }) {
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

function App() {
  const [draft, setDraft] = useState([]);
  const main = useRef(null);
  const moved = useRef(false);
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const route = routes.find(item => item.path === path);
  useEffect(() => {
    document.title = `${route?.title ?? '페이지 없음'} · Pathfolio`;
    if (moved.current) main.current.querySelector('h1')?.focus();
    moved.current = true;
  }, [path, route]);

  function addCourse(code, term) {
    if (!courses.some(course => course.code === code) || !terms.some(option => option.id === term)) return;
    setDraft(items => items.some(item => item.code === code) ? items : [...items, { code, term }]);
    navigate('/roadmap');
  }

  return <>
    <header className="site-header">
      <Link to="/" className="brand"><span aria-hidden="true">P</span> Pathfolio</Link>
      <span>대학 학업 로드맵</span>
    </header>
    <div className="layout">
      <nav aria-label="주 메뉴">
        {routes.map(item => <NavLink key={item.path} to={item.path} end>
          <span aria-hidden="true">{item.icon}</span>{item.title}
        </NavLink>)}
        <span className="nav-disabled"><span aria-hidden="true">□</span>비교과 <small>준비 중</small></span>
      </nav>
      <main ref={main}>
        <p className="sample-notice"><strong>시연용 sample 데이터</strong> · 공식 학업 자료나 학사 판정으로 사용할 수 없습니다.</p>
        <Routes>
          <Route path="/" element={<Dashboard draft={draft} />} />
          <Route path="/academic" element={<Academic />} />
          <Route path="/courses" element={<Recommendations draft={draft} onAdd={addCourse} />} />
          <Route path="/roadmap" element={<Roadmap draft={draft} />} />
          <Route path="*" element={<><PageTitle title="페이지를 찾을 수 없습니다" /><Link to="/">대시보드로 돌아가기</Link></>} />
        </Routes>
      </main>
    </div>
  </>;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
