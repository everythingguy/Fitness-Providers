/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useRef, useState } from "react";
import { loadScript } from "@paypal/paypal-js";
import { Navigate } from "react-router-dom";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";
import { Provider } from "../../../API";
import SubscriptionAPI from "../../../API/Subscription";
import { Subscription as SubscriptionType } from "../../../@types/Paypal";
import { formatDateTime } from "../../../utils/Date";

interface Props {}

export const SubscriptionManagement: React.FC<Props> = () => {
    const { loggedIn, user, setLogin } = useContext(UserContext);
    const [subscription, setSubscription] = useState<SubscriptionType | null>(
        null
    );
    const buttonsDIV = useRef<HTMLDivElement>(null);

    // TODO: prevent unlimited free trials
    // cancel button confirmation (are you sure? your classes will be hidden from public view)
    // on cancel, keep isEnrolled = true until their last month is over

    useEffect(() => {
        if (user && user.provider) {
            if (user.provider.subscription && user.provider.isEnrolled) {
                SubscriptionAPI.getSubscription().then((resp) => {
                    if (resp.success) setSubscription(resp.data.subscription);
                });
            } else
                loadScript({
                    "client-id": process.env.PAYPAL_CLIENT_ID!,
                    vault: true,
                    intent: "subscription"
                })
                    .then((paypal) => {
                        if (paypal)
                            paypal.Buttons!({
                                style: {
                                    layout: "horizontal",
                                    color: "blue",
                                    label: "subscribe",
                                    height: 55,
                                    tagline: false
                                },
                                createSubscription: function (data, actions) {
                                    return actions.subscription.create({
                                        plan_id: process.env.PAYPAL_PLAN_ID!,
                                        custom_id: user!.provider!._id
                                    });
                                },
                                onApprove: async function (data) {
                                    await Provider.updateProvider(
                                        user!.provider!._id,
                                        {
                                            subscription: data.subscriptionID
                                        }
                                    );

                                    if (buttonsDIV.current)
                                        while (buttonsDIV.current.firstChild)
                                            buttonsDIV.current.removeChild(
                                                buttonsDIV.current.firstChild
                                            );

                                    if (setLogin) await setLogin(true);
                                }
                            })
                                .render("#paypal-buttons")
                                .catch((error) => {
                                    // eslint-disable-next-line no-console
                                    console.error(
                                        "failed to render the PayPal Buttons",
                                        error
                                    );
                                });
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(
                            "failed to load the PayPal JS SDK script",
                            error
                        );
                    });
        }
    }, [user]);

    const cancelSub = () => {
        SubscriptionAPI.cancelSubscription().then(async () => {
            setSubscription(null);
            if (setLogin) await setLogin(true);
        });
    };

    if (!loggedIn) return <Navigate to="/user/login" />;
    if (user && !user.provider)
        return <Navigate to="/user/settings?createProvider=true" />;

    return (
        <>
            <SettingsHeader activePage="subscription" />
            {user && user.provider && (
                <>
                    {user.provider.subscription && user.provider.isEnrolled ? (
                        <>
                            {subscription && (
                                <div className="mt-3 mb-5">
                                    <h3 className="mb-3">
                                        Status: {subscription.status}
                                    </h3>
                                    <h3 className="mb-3">
                                        Subscribe Date:{" "}
                                        {formatDateTime(
                                            subscription.start_time
                                        )}
                                    </h3>
                                    <h3 className="mb-3">
                                        Next Payment Date:{" "}
                                        {formatDateTime(
                                            subscription.billing_info
                                                .next_billing_time
                                        )}
                                    </h3>
                                    <h3 className="mb-3">
                                        PayPal Email:{" "}
                                        {subscription.subscriber.email_address}
                                    </h3>
                                </div>
                            )}
                            <div className="mt-3 d-flex justify-content-center">
                                <a
                                    href={`https://www.sandbox.paypal.com/myaccount/autopay/connect/${user.provider.subscription}`} // TODO: change domain
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="p-3 me-3 btn btn-dark fw-bold text-light"
                                >
                                    View on PayPal
                                </a>
                                <button
                                    onClick={cancelSub}
                                    className="p-3 btn btn-dark fw-bold text-light"
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="d-flex justify-content-center">
                                <div className="mt-3 mb-5 text-center">
                                    <h1>
                                        $25.00{" "}
                                        <span style={{ fontSize: "1rem" }}>
                                            /month
                                        </span>
                                    </h1>
                                    <h1>First Month FREE</h1>
                                    <h3 className="mt-3">Features</h3>
                                    <div className="d-flex justify-content-center">
                                        <ul className="text-start w-50">
                                            <li>Create Courses</li>
                                            <li>Schedule Live Events</li>
                                            <li>
                                                Share your online video courses
                                            </li>
                                            <li>Gain Exposure</li>
                                        </ul>
                                    </div>
                                    <h3>What does the money go towards?</h3>
                                    <div className="text-start">
                                        <p>
                                            Our subscription model allow us to
                                            continue development of the website
                                            in order to create new features for
                                            our users. The subscription model
                                            also allows us to advertise the site
                                            to gain you additional exposure for
                                            your fitness courses.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center">
                                <div
                                    ref={buttonsDIV}
                                    className="w-50"
                                    id="paypal-buttons"
                                ></div>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default SubscriptionManagement;
