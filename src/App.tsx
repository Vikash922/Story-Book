/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {Analytics} from '@vercel/analytics/react';
import DisguisedApp from './components/DisguisedApp';

export default function App() {
  return (
    <>
      <DisguisedApp />
      <Analytics />
    </>
  );
}

