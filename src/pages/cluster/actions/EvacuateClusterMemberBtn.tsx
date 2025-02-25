import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";
import { postClusterMemberState } from "api/cluster";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdClusterMember } from "types/cluster";

interface Props {
  member: LxdClusterMember;
}

const EvacuateClusterMemberBtn: FC<Props> = ({ member }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleEvacuate = () => {
    setLoading(true);
    postClusterMemberState(member, "evacuate")
      .then(() => {
        setLoading(false);
        notify.success(
          `Cluster member ${member.server_name} evacuation started.`
        );
      })
      .catch((e) => notify.failure("Cluster member evacuation failed", e))
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster],
        });
      });
  };

  return (
    <ConfirmationButton
      toggleAppearance=""
      isLoading={isLoading}
      toggleCaption="Evacuate"
      title="Confirm evacuation"
      confirmMessage={
        <>
          This will evacuate cluster member{" "}
          <ItemName item={{ name: member.server_name }} bold />.
        </>
      }
      confirmButtonLabel="Evacuate"
      onConfirm={handleEvacuate}
      isDense={false}
    />
  );
};

export default EvacuateClusterMemberBtn;
