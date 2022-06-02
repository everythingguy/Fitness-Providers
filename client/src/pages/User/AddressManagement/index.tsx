import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Address as AddressType } from "../../../@types/Models";
import Address from "../../../API/Address";
import { ResultList } from "../../../components";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";
import { Error403 } from "../../ErrorPages/403";
import { AddressModal, DeleteModal } from "../../Profile/Management/Modals";

interface Props {}

// TODO: add address button

export const AddressManagement: React.FC<Props> = () => {
    const { loggedIn, user } = useContext(UserContext);

    const [addresses, setAddresses] = useState<AddressType[]>([]);
    const [showDeleteModal, setDeleteModal] = useState(false);
    const [showAddressModal, setAddressModal] = useState(false);
    const [editDeleteInfo, setEditDeleteInfo] = useState<
        | {
              type: "course" | "session" | "live session" | "address";
              id: string;
          }
        | false
    >(false);

    useEffect(() => {
        if (user && user.provider && !showAddressModal && !showDeleteModal)
            Address.getProvidersAddresses(user.provider._id).then((resp) => {
                if (resp.success) setAddresses(resp.data.addresses);
            });
    }, [showAddressModal, showDeleteModal]);

    if (!loggedIn) return <Navigate to="/user/login" />;
    if (!(user && user.provider)) return <Error403 />;

    return (
        <>
            <SettingsHeader activePage="address" />
            <ResultList
                title="Addresses"
                items={addresses.map((a) => ({
                    _id: a._id,
                    title: a.street2 ? `${a.street1}, ${a.street2}` : a.street1,
                    subtitle: `${a.city}, ${a.state} ${a.zip} ${a.country}`
                }))}
                onEdit={(id) => {
                    setEditDeleteInfo({ id, type: "address" });
                    setAddressModal(true);
                }}
                onDelete={(id) => {
                    setEditDeleteInfo({ id, type: "address" });
                    setDeleteModal(true);
                }}
            />
            <AddressModal
                showModal={showAddressModal}
                setModal={setAddressModal}
                onSuccess={(address) => {
                    setAddresses([...addresses, address]);
                }}
                info={editDeleteInfo}
                setInfo={setEditDeleteInfo}
            />
            <DeleteModal
                showModal={showDeleteModal}
                setModal={setDeleteModal}
                info={editDeleteInfo}
                setInfo={setEditDeleteInfo}
            />
        </>
    );
};

export default AddressManagement;
