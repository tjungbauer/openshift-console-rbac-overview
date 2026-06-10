/**
 * @file RbacNavLink.tsx
 * react-router Link to RBAC Overview with query params.
 */
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { buildRbacOverviewPath } from './rbacLinks';
import type { RbacUrlParams } from './urlParams';

type RbacNavLinkProps = {
  params: RbacUrlParams;
  children: ReactNode;
  className?: string;
};

export const RbacNavLink: FC<RbacNavLinkProps> = ({ params, children, className }) => (
  <Link to={buildRbacOverviewPath(params)} className={className}>
    {children}
  </Link>
);
