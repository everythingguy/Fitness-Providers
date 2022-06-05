import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Info } from "../../../@types/misc";
import { Address as AddressType } from "../../../@types/Models";
import Address from "../../../API/Address";
import { ResultList } from "../../../components";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";
import { Error403 } from "../../ErrorPages/403";
import { AddressModal, DeleteModal } from "../../Profile/Management/Modals";

interface Props {}

export const AddressManagement: React.FC<Props> = () => {
    const { loggedIn, user } = useContext(UserContext);

    const [addresses, setAddresses] = useState<AddressType[]>([]);
    const [showDeleteModal, setDeleteModal] = useState(false);
    const [showAddressModal, setAddressModal] = useState(false);
    const [editDeleteInfo, setEditDeleteInfo] = useState<Info>(false);

    useEffect(() => {
        // TODO: Get all addresses (pagination)
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
            <div className="d-flex justify-content-center">
                <button
                    className="btn btn-dark fw-bold text-light mt-4"
                    onClick={() => setAddressModal(true)}
                >
                    Add Address
                </button>
            </div>
            <AddressModal
                showModal={showAddressModal}
                setModal={setAddressModal}
                info={editDeleteInfo}
                setInfo={setEditDeleteInfo}
                onCancel={() => setEditDeleteInfo(false)}
                onSuccess={() => setEditDeleteInfo(false)}
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
