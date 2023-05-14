import { GraphNode } from "./graph/GraphNode";
import DisplayedRegionModel from "./DisplayedRegionModel";
import { Feature } from "./Feature";
import { FeaturePlacer, PlacedFeature } from "./FeaturePlacer";
import LinearDrawingModel from "./LinearDrawingModel";
import OpenInterval from "./interval/OpenInterval";

export interface PlacedFeatureGroup {
    feature: Feature;
    row: number;
    xSpan: OpenInterval;
    placedFeatures: PlacedFeature[];
}

export type PaddingFunc = (feature: Feature, xSpan: OpenInterval) => number;

/**
 * Return value from GraphNodeArranger::arrange()
 */
export interface GraphNodeArrangementResult {
    placements: PlacedFeatureGroup[]; // The draw locations of features that are visible
    numRowsAssigned: number; // Number of rows required to view all features
    numHidden: number; // Number of features omitted from featureArrangement
    allNodesOutOfView: GraphNode[];
}

const FEATURE_PLACER = new FeaturePlacer();

export class GraphNodeArranger {
    /**
     * Assigns rows to each placed feature, mutating the objects.  Returns the number of rows assigned.
     *
     * @param {PlacedFeature[]} groups - placed features to modify
     * @param {number | PaddingFunc} padding - getter of padding.  See the arrange() method for more info.
     * @return {number} the number of rows assigned
     */
    _assignRows(groups: PlacedFeatureGroup[], padding: number | PaddingFunc): number {
        groups.sort((a, b) => a.xSpan.start - b.xSpan.start);

        const maxXsForRows: number[] = [];
        const isConstPadding = typeof padding === "number";
        for (const group of groups) {
            const horizontalPadding = isConstPadding
                ? (padding as number)
                : (padding as PaddingFunc)(group.feature, group.xSpan);
            const startX = group.xSpan.start - horizontalPadding;
            const endX = group.xSpan.end + horizontalPadding;
            // Find the first row where the interval won't overlap with others in the row
            let row = maxXsForRows.findIndex((maxX) => maxX < startX);
            if (row === -1) {
                // Couldn't find a row -- make a new one
                maxXsForRows.push(endX);
                row = maxXsForRows.length - 1;
            } else {
                maxXsForRows[row] = endX;
            }
            group.row = row;
        }

        return maxXsForRows.length;
    }

    _assignDefaultRow(placements: PlacedFeature[]): PlacedFeatureGroup[] {
        placements.sort((a, b) => a.xSpan.start - b.xSpan.start);
        const groups: PlacedFeatureGroup[] = [];
        let i = 0;
        while (i < placements.length) {
            groups.push({
                feature: placements[i].feature,
                row: -1,
                xSpan: placements[i].xSpan,
                placedFeatures: [placements[i]],
            });
            i++;
        }
        return groups;
    }

    /**
     * Calculates draw locations for an array of features, as well rows indices to minimize overlaps.  This method skips
     * features too small to draw; the number skipped shall be in the return result.
     *
     * The optional `padding` parameter configures horizontal padding for intervals:
     * * If `padding` is a number, all intervals will have that constant padding.
     * * If `padding` is a function, it should take a feature and return the desired horizontal padding.
     *
     * @param {Feature[]} features - features to draw
     * @param {DisplayedRegionModel} viewRegion - used to compute drawing coordinates
     * @param {number} width - width of the visualization
     * @param {number | PaddingFunc} [padding] - horizontal padding for intervals.  Default 0.
     * @param {number} [hiddenPixels] - hide an item when its length less than this value.  Default 0.5
     * @return  GraphNodeArrangementResult} suggested draw location info
     */
    arrange(
        nodes: GraphNode[],
        viewRegion: DisplayedRegionModel,
        width: number,
        padding: number | PaddingFunc = 0,
        hiddenPixels: number = 0
    ): GraphNodeArrangementResult {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const visibleNodes = nodes.filter((feature) => drawModel.basesToXWidth(feature.getLength()) >= hiddenPixels);
        const results: PlacedFeatureGroup[] = [],
            allNodesOutOfView: GraphNode[] = [];
        for (const node of visibleNodes) {
            const { placements, nodesOutOfView } = FEATURE_PLACER.placeGraphNodes([node], viewRegion, width);
            results.push(...this._assignDefaultRow(placements));
            allNodesOutOfView.push(...nodesOutOfView);
        }
        const numRowsAssigned = this._assignRows(results, padding);
        return {
            placements: results,
            numRowsAssigned,
            numHidden: nodes.length - visibleNodes.length,
            allNodesOutOfView,
        };
    }
}

export default GraphNodeArranger;
