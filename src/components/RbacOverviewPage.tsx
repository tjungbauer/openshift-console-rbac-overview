/**
 * @file RbacOverviewPage.tsx
 * Console plugin entry module — referenced by console-extensions.json ($codeRef).
 * Loads plugin CSS and renders the full page view.
 */
import type { FC } from 'react';

import './rbac-overview/rbac-overview.css';
import { RbacOverviewPageView } from './RbacOverviewPageView';

/** Exposed to the console as the /rbac-overview route component. */
const RbacOverviewPage: FC = () => <RbacOverviewPageView />;

export default RbacOverviewPage;
