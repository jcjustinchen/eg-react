import { TrackConfig } from "./TrackConfig";
import { NumericalTrackConfig } from "./NumericalTrackConfig";
import NumericalTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/numerical/NumericalTrack";
import { BigGmodWorker } from "../../dataSources/WorkerTSHook";
import LocalBigSourceGmod from "../../dataSources/big/LocalBigSourceGmod";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { NumericalFeature } from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import TrackModel, { TrackOptions } from "model/TrackModel";
import { BigWig } from '@gmod/bbi';
import { BlobFile, LocalFile } from "generic-filehandle";

export class BigWigTrackConfig extends TrackConfig {
    private numericalTrackConfig: NumericalTrackConfig;
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.numericalTrackConfig = new NumericalTrackConfig(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        // const testBW = new BigWig({ filehandle: this.trackModel.fileObj });
        // const testBW = new BigWig({ path: this.trackModel.url });
        // const testBW = new BigWig({ filehandle: new LocalFile(this.trackModel.url) });
        // console.log(testBW);

        // console.log(new LocalFile('/home/repos/Test_Tracks/testFile.txt'));
        
        console.log(this.trackModel);
        // if (this.trackModel.isLocalFile) {
            // return new LocalBigSourceGmod(new Blob(
            //     [JSON.stringify({
            //         name: this.trackModel.name,
            //         path: this.trackModel.url,
            //         size: this.trackModel.size,
            //         type: this.trackModel.type,
            //     }, null, 2)],
            //     {type : 'text/plain'}
            // ));
            return new LocalBigSourceGmod(this.trackModel.fileObj);
        // } else {
        //     return new WorkerSource(BigGmodWorker, this.trackModel.url);
        // }
    }

    /*
    Expected DASFeature schema

    interface DASFeature {
        max: number; // Chromosome base number, end
        maxScore: number;
        min: number; // Chromosome base number, start
        score: number; // Value at the location
        segment: string; // Chromosome name
        type: string;
        _chromId: number
    */
    /**
     * Converter of DASFeatures to NumericalFeature.
     *
     * @param {DASFeature[]} data - DASFeatures to convert
     * @return {NumericalFeature[]} NumericalFeatures made from the input
     *
     */
    /**
     *
     * Jul-24-2021 @Daofeng switched to use @gmod/bbi
     */
    formatData(data: any[]) {
        // console.log(data);
        return data.map(
            (feature) =>
                new NumericalFeature("", new ChromosomeInterval(feature.chr, feature.start, feature.end)).withValue(
                    feature.score
                )
            // new NumericalFeature("", new ChromosomeInterval(feature.segment, feature.min, feature.max)).withValue(
            //     feature.score
            // )
        );
    }

    /**
     * @override
     */
    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return oldOptions.ensemblStyle !== newOptions.ensemblStyle;
    }

    getComponent() {
        return NumericalTrack;
    }

    getMenuComponents() {
        return [...this.numericalTrackConfig.getMenuComponents()];
    }
}
