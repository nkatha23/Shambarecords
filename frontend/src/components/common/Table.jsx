import React from 'react';

export default function Table({ columns, rows, emptyMessage = 'No records found.' }) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--color-light)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0.65rem 1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--color-text-dark)',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid var(--color-light-shade-50)',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.02em',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--color-text)',
                  opacity: 0.6,
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                style={{
                  borderBottom: '1px solid var(--color-light-shade-50)',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '0.75rem 1rem',
                      color: 'var(--color-text)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
