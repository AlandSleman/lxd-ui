import React, { FC, Fragment, ReactNode } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import {
  LxdInstance,
  LxdInstanceAction,
  LxdInstanceStatus,
} from "types/instance";
import {
  instanceAction,
  pluralizeInstance,
  statusLabel,
} from "util/instanceBulkActions";
import { ICONS, ValueOf } from "@canonical/react-components";

interface Props {
  action: LxdInstanceAction;
  confirmAppearance?: string;
  confirmExtra?: ReactNode;
  confirmLabel: string;
  icon?: ValueOf<typeof ICONS> | string;
  instances: LxdInstance[];
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const InstanceBulkAction: FC<Props> = ({
  action,
  confirmAppearance,
  confirmExtra,
  confirmLabel,
  icon,
  instances,
  isLoading,
  isDisabled,
  onClick,
}) => {
  const selectedStates = new Set(instances.map((item) => item.status));
  const hasDifferentStates = selectedStates.size > 1;
  const selectedSummary = hasDifferentStates ? (
    <>
      <b>{instances.length}</b> {pluralizeInstance(instances.length)} selected:
      <br />
      <br />
    </>
  ) : null;

  const hasChangedStates = [...selectedStates].some(
    (state) => instanceAction(action, state) !== undefined
  );

  const statusLine = (
    currentState: LxdInstanceStatus,
    desiredAction: LxdInstanceAction
  ) => {
    const count = instances.filter(
      (instance) => instance.status === currentState
    ).length;

    if (count === 0) {
      return null;
    }

    const status = statusLabel(currentState) ?? "";
    const actionRaw = instanceAction(desiredAction, currentState);

    if (actionRaw === undefined) {
      const instance = count === 1 ? "instance that is" : "instances that are";
      const already = desiredAction !== "restart" ? "already " : "";
      return (
        <Fragment key={currentState + desiredAction}>
          - No action for <b>{count}</b> {instance} {already}
          {currentState.toLowerCase().replace("frozen", "paused")}.
          <br />
        </Fragment>
      );
    }

    const indent = hasDifferentStates ? "- " : "";

    return (
      <Fragment key={currentState + desiredAction}>
        {indent}
        This will {desiredAction.replace("freeze", "pause")} <b>{count}</b>
        {` ${status} ${pluralizeInstance(count)}.`}
        <br />
      </Fragment>
    );
  };

  // no action states should be last
  const getLineOrder = (): LxdInstanceStatus[] => {
    switch (action) {
      case "start":
        return ["Frozen", "Stopped", "Running"];
      case "restart":
        return ["Running", "Freezing", "Stopped", "Frozen"];
      case "freeze":
        return ["Running", "Stopped", "Frozen"];
      case "stop":
        return ["Frozen", "Freezing", "Running", "Starting", "Stopped"];
      default:
        return [];
    }
  };

  return (
    <ConfirmationButton
      className="u-no-margin--right u-no-margin--bottom bulk-action"
      confirmButtonAppearance={confirmAppearance}
      confirmButtonLabel={confirmLabel}
      confirmExtra={confirmExtra}
      confirmMessage={
        <>
          {selectedSummary}
          {getLineOrder().map((state) => statusLine(state, action))}
        </>
      }
      icon={icon}
      isDense={false}
      isDisabled={isDisabled || !hasChangedStates}
      isLoading={isLoading}
      onConfirm={onClick}
      title={`Confirm ${confirmLabel.toLowerCase()}`}
      toggleAppearance="base"
      toggleCaption={confirmLabel}
    />
  );
};

export default InstanceBulkAction;
