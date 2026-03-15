import React, { useState } from 'react';
import { Intro } from 'components';
import WinXP from 'WinXP';

const App = () => {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <>
      {!introFinished && <Intro onFinish={() => setIntroFinished(true)} />}
      {introFinished && <WinXP />}
    </>
  );
};

export default App;
