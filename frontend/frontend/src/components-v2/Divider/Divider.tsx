import { FC } from 'react'

interface IDividerProps {
  label?: string
}

const Divider: FC<IDividerProps> = ({ label }) => (
  <div
    className="mt-4 mb-4"
    style={{ width: '100%', height: 15, borderBottom: '1px solid #EAECF0', textAlign: 'center' }}
  >
    {label && (
      <span style={{ fontSize: 14, backgroundColor: 'white', padding: '0 5px', color: '#777675', fontWeight: 500 }}>
        {label}
      </span>
    )}
  </div>
)

export default Divider
