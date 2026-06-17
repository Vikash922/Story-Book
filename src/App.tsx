/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SpeedInsights} from '@vercel/speed-insights/react';
import DisguisedApp from './components/DisguisedApp';

export default function App() {
  return (
    <>
      <DisguisedApp />
      <SpeedInsights />
    </>
  );
}

