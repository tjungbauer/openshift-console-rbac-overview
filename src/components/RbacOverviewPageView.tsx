/**
 * @file RbacOverviewPageView.tsx
 * Page shell: title, help text, PatternFly Tabs. Hides tabs the user cannot access
 * and redirects the URL when the active tab becomes unavailable.
 */
import {
  DocumentTitle,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateBody,
  PageSection,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import type { FC } from 'react';
import { K } from './rbac-overview/i18nKeys';
import { useEffect } from 'react';

import { RBAC_TAB_COMPONENTS, RBAC_TAB_LABEL_KEYS } from './rbac-overview/tabRegistry';
import type { RbacTabKey } from './rbac-overview/types';
import { useRbacOverviewPageModel } from './rbac-overview/useRbacOverviewPageModel';
import { TabLoadingState } from './rbac-overview/StateFeedback';
import { useVisibleTabs } from './rbac-overview/useVisibleTabs';

export const RbacOverviewPageView: FC = () => {
  const { t, activeTab, pushRbacTab } = useRbacOverviewPageModel();
  const { visibleTabs, loading: tabsLoading, defaultTab } = useVisibleTabs();

  // If user deep-links to a tab they cannot open, move them to the first allowed tab.
  useEffect(() => {
    if (tabsLoading || !defaultTab) {
      return;
    }
    if (!visibleTabs.includes(activeTab)) {
      pushRbacTab(defaultTab);
    }
  }, [activeTab, defaultTab, pushRbacTab, tabsLoading, visibleTabs]);

  return (
    <>
      <DocumentTitle>{t(K.page.title)}</DocumentTitle>
      <ListPageHeader
        title={t(K.page.title)}
        helpText={t(K.page.helpText)}
      />
      <PageSection>
        {tabsLoading ? (
          <TabLoadingState />
        ) : !visibleTabs.length ? (
          <EmptyState>
            <EmptyStateBody>
              {t(K.page.noTabAccess)}
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <Tabs
            mountOnEnter
            unmountOnExit
            activeKey={visibleTabs.includes(activeTab) ? activeTab : defaultTab ?? visibleTabs[0]}
            onSelect={(_event, tabKey) => pushRbacTab(tabKey as RbacTabKey)}
          >
            {visibleTabs.map((tabKey) => {
              const TabComponent = RBAC_TAB_COMPONENTS[tabKey];
              return (
                <Tab
                  key={tabKey}
                  eventKey={tabKey}
                  title={<TabTitleText>{t(RBAC_TAB_LABEL_KEYS[tabKey])}</TabTitleText>}
                >
                  <TabComponent />
                </Tab>
              );
            })}
          </Tabs>
        )}
      </PageSection>
    </>
  );
};
