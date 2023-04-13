import React, { FC, useState } from "react";
import { updateInstanceBulkAction } from "api/instances";
import { useNotify } from "context/notify";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationForce from "components/ConfirmationForce";
import { LxdInstance, LxdInstanceAction } from "types/instance";
import {
  instanceActionLabel,
  instanceActions,
  pluralizeInstance,
} from "util/instanceBulkActions";
import InstanceBulkAction from "pages/instances/actions/InstanceBulkAction";

interface Props {
  instances: LxdInstance[];
  onStart: () => void;
  onFinish: () => void;
}

const InstanceBulkActions: FC<Props> = ({ instances, onStart, onFinish }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<LxdInstanceAction | null>(
    null
  );
  const [isForce, setForce] = useState(false);

  const handleAction = (desiredAction: LxdInstanceAction) => {
    setActiveAction(desiredAction);
    onStart();
    const actions = instanceActions(instances, desiredAction);

    updateInstanceBulkAction(actions, isForce)
      .then(() => {
        const count = actions.length;
        const action = instanceActionLabel(desiredAction);
        notify.success(
          <>
            <b>{count}</b> {pluralizeInstance(count)} {action}.
          </>
        );
      })
      .catch((e) => notify.failure(`Instance ${desiredAction} failed`, e))
      .finally(() => {
        setForce(false);
        onFinish();
        setActiveAction(null);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      });
  };

  return (
    <div className="p-segmented-control bulk-actions">
      <div className="p-segmented-control__list bulk-action-frame">
        <InstanceBulkAction
          icon="play"
          isLoading={activeAction === "start"}
          isDisabled={activeAction === "start"}
          onClick={() => handleAction("start")}
          confirmAppearance="positive"
          action="start"
          instances={instances}
          confirmLabel="Start"
        />
        <InstanceBulkAction
          icon="restart"
          isLoading={activeAction === "restart"}
          isDisabled={activeAction === "restart"}
          onClick={() => handleAction("restart")}
          action="restart"
          instances={instances}
          confirmLabel="Restart"
          confirmExtra={
            <ConfirmationForce
              label="Force restart"
              force={[isForce, setForce]}
            />
          }
        />
        <InstanceBulkAction
          icon="pause"
          isLoading={activeAction === "freeze"}
          isDisabled={activeAction === "freeze"}
          onClick={() => handleAction("freeze")}
          action="freeze"
          instances={instances}
          confirmLabel="Pause"
        />
        <InstanceBulkAction
          icon="stop"
          isLoading={activeAction === "stop"}
          isDisabled={false}
          onClick={() => handleAction("stop")}
          action="stop"
          instances={instances}
          confirmLabel="Stop"
          confirmExtra={
            <ConfirmationForce label="Force stop" force={[isForce, setForce]} />
          }
        />
      </div>
    </div>
  );
};

export default InstanceBulkActions;
