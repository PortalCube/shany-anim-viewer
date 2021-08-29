import React from "react";

interface AppMenuProp {
    name: string;
    id: string;
}

export default class DressButton extends React.Component<AppMenuProp> {
    render() {
        return (
            <div className="dressButton">
                <img
                    width="80"
                    height="80"
                    src={`https://storage.prisism.io/sc/images/content/idols/costume_stand_icon/${this.props.id}.png`}
                />
                <img
                    width="80"
                    height="80"
                    src={`https://storage.prisism.io/sc/images/content/idols/costume_stand_live_icon/${this.props.id}.png`}
                />
                <div>
                    <p>{this.props.name}</p>
                    <p>{this.props.id}</p>
                </div>
            </div>
        );
    }
}
