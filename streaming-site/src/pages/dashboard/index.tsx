import { useState, useEffect } from 'react';

function Dashboard() {
  const [name, setName] = useState('');

  useEffect(() => {
    console.log('Dashboard');
    fetch('/api/user?loginToken=' + localStorage.getItem('loginToken'))
    .then(res => res.text())
    .then(name => {
      setName(name);
    })
    .catch(err => console.log(err));

  }, []);

  return (
    <div>
      <h1>Hi {name}</h1>
    </div>
  )
}

export default Dashboard
