import React from "react";
import DressButton from "./dressButton";

export default class AppMenu extends React.Component {
    render() {
        return (
            <div className="menu">
                <DressButton {...{ name: "사쿠라기 마노", id: "1040010010" }} />
                <DressButton name="카자노 히오리" id="1040020010" />
                <DressButton name="하치미야 메구루" id="1040030010" />
            </div>
        );
    }
}
