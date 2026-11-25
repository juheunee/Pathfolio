import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router';
import { courses, terms } from './data/sample.js';
import Dashboard from './pages/Dashboard.jsx';
import Academic from './pages/Academic.jsx';
import Courses from './pages/Courses.jsx';
import Roadmap from './pages/Roadmap.jsx';
import NotFound from './pages/NotFound.jsx';

const routes = [
  { path: '/', title: '대시보드', icon: '⌂' },
  { path: '/academic', title: '학업 현황', icon: '▥' },
  { path: '/courses', title: '교과목', icon: '▤' },
  { path: '/roadmap', title: '로드맵', icon: '◇' },
];

export default function App() {
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
          <Route path="/courses" element={<Courses draft={draft} onAdd={addCourse} />} />
          <Route path="/roadmap" element={<Roadmap draft={draft} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </>;
}
