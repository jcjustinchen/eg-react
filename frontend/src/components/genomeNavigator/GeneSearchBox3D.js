import React from "react";
import PropTypes from "prop-types";
import GeneSearchBoxBase from "./GeneSearchBoxBase";

/**
 * gene search box for 3d module.
 *
 * @author Daofeng Li
 */
class GeneSearchBox3D extends React.PureComponent {
    static propTypes = {
        setGeneCallback: PropTypes.func.isRequired,
    };

    /**
     * @param {Gene} gene
     */
    setGene = (gene) => {
        this.props.setGeneCallback(gene);
    };

    render() {
        const { color, background } = this.props;
        return (
            <GeneSearchBoxBase
                onGeneSelected={this.setGene}
                simpleMode={true}
                voiceInput={false}
                color={color}
                background={background}
            />
        );
    }
}

export default GeneSearchBox3D;
