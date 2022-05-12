"use strict";

import classNames from "classnames";
import createReactClass from "create-react-class";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import { sortable } from "react-anything-sortable";
import { withTranslation } from "react-i18next";
import getPath from "terriajs/lib/Core/getPath";
import CatalogMemberMixin from "terriajs/lib/ModelMixins/CatalogMemberMixin";
import ReferenceMixin from "terriajs/lib/ModelMixins/ReferenceMixin";
import CommonStrata from "terriajs/lib/Models/Definition/CommonStrata";
import Box from "terriajs/lib/Styled/Box";
import Icon from "terriajs/lib/Styled/Icon";
import Loader from "terriajs/lib/ReactViews/Loader";
import PrivateIndicator from "terriajs/lib/ReactViews/PrivateIndicator/PrivateIndicator";
import WorkbenchItemControls from "terriajs/lib/ReactViews/Workbench/Controls/WorkbenchItemControls";
import Styles from "terriajs/lib/ReactViews/Workbench/workbench-item.scss";

WorkbenchItemFactory.deps = [];

export default function WorkbenchItemFactory() {
  const WorkbenchItemRaw = observer(
    createReactClass({
      displayName: "WorkbenchItem",

      propTypes: {
        style: PropTypes.object,
        className: PropTypes.string,
        onMouseDown: PropTypes.func.isRequired,
        onTouchStart: PropTypes.func.isRequired,
        item: PropTypes.object.isRequired,
        viewState: PropTypes.object.isRequired,
        setWrapperState: PropTypes.func,
        t: PropTypes.func.isRequired
      },

      toggleDisplay() {
        runInAction(() => {
          this.props.item.setTrait(
            CommonStrata.user,
            "isOpenInWorkbench",
            !this.props.item.isOpenInWorkbench
          );
        });
      },

      openModal() {
        this.props.setWrapperState({
          modalWindowIsOpen: true,
          activeTab: 1,
          previewed: this.props.item
        });
      },

      toggleVisibility() {
        runInAction(() => {
          this.props.item.setTrait(
            CommonStrata.user,
            "show",
            !this.props.item.show
          );
        });
      },

      render() {
        const workbenchItem = this.props.item;
        const { t } = this.props;
        const isLoading =
          (CatalogMemberMixin.isMixedInto(this.props.item) &&
            this.props.item.isLoading) ||
          (ReferenceMixin.isMixedInto(this.props.item) &&
            this.props.item.isLoadingReference);
        return (
          <li
            style={this.props.style}
            className={classNames(this.props.className, Styles.workbenchItem, {
              [Styles.isOpen]: workbenchItem.isOpenInWorkbench
            })}
            css={`
              color: ${p => p.theme.textLight};
              background: ${p => p.theme.darkWithOverlay};
            `}
          >
            <Box fullWidth justifySpaceBetween padded>
              <Box>
                <If condition={true || workbenchItem.supportsToggleShown}>
                  <Box
                    leftSelf
                    className={Styles.visibilityColumn}
                    css={`
                      padding: 3px 5px;
                    `}
                  >
                    <button
                      type="button"
                      onClick={this.toggleVisibility}
                      title={t("workbench.toggleVisibility")}
                      className={Styles.btnVisibility}
                    >
                      {workbenchItem.show ? (
                        <Icon glyph={Icon.GLYPHS.checkboxOn} />
                      ) : (
                        <Icon glyph={Icon.GLYPHS.checkboxOff} />
                      )}
                    </button>
                  </Box>
                </If>
              </Box>
              <Box className={Styles.nameColumn}>
                <Box fullWidth paddedHorizontally>
                  <div
                    onMouseDown={this.props.onMouseDown}
                    onTouchStart={this.props.onTouchStart}
                    className={Styles.draggable}
                    title={getPath(workbenchItem, " → ")}
                  >
                    <If condition={!workbenchItem.isMappable && !isLoading}>
                      <span className={Styles.iconLineChart}>
                        <Icon glyph={Icon.GLYPHS.lineChart} />
                      </span>
                    </If>
                    {workbenchItem.name}
                  </div>
                </Box>
              </Box>
              <Box>
                <Box className={Styles.toggleColumn} alignItemsFlexStart>
                  <button
                    type="button"
                    className={Styles.btnToggle}
                    onClick={this.toggleDisplay}
                    css={`
                      display: flex;
                      min-height: 24px;
                      align-items: center;
                      padding: 5px;
                    `}
                  >
                    {workbenchItem.isPrivate && (
                      <Box paddedHorizontally>
                        <PrivateIndicator inWorkbench />
                      </Box>
                    )}
                    {workbenchItem.isOpenInWorkbench ? (
                      <Icon glyph={Icon.GLYPHS.opened} />
                    ) : (
                      <Icon glyph={Icon.GLYPHS.closed} />
                    )}
                  </button>
                </Box>
                <div className={Styles.headerClearfix} />
              </Box>
            </Box>

            <If condition={workbenchItem.isOpenInWorkbench}>
              <div className={Styles.inner}>
                <WorkbenchItemControls
                  item={this.props.item}
                  viewState={this.props.viewState}
                />
                {isLoading ? (
                  <Box paddedVertically>
                    <Loader light />
                  </Box>
                ) : null}
              </div>
            </If>
          </li>
        );
      }
    })
  );

  return sortable(withTranslation()(WorkbenchItemRaw));
}
