import React from 'react';

export default function PageTitle({ title, children }) {
  return <div className="page-title"><h1 tabIndex={-1}>{title}</h1>{children}</div>;
}
