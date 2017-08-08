"use strict"

import DisplayedRegionModel from './DisplayedRegionModel.js';

const CHROMOSOMES = [
    {
        name: "chr1",
        lengthInBases: 10,
    },
    {
        name: "chr2",
        lengthInBases: 10,
    },
    {
        name: "chr3",
        lengthInBases: 10,
    },
];

function expectRegion(instance, start, end) {
    // For a less flaky test, I would want to manually compare just the `start` and `end` props, but done this way,
    // failure messages are more readable.
    expect(instance.getAbsoluteRegion()).toEqual({start: start, end: end});
}

var instance;
beforeEach(() => {
    instance = new DisplayedRegionModel("My little genome", CHROMOSOMES);
});

/*
 * Test setRegion() first since a lot of our other tests rely on it.
 */
describe("setRegion()", () => {
    it("fails if end is less than start", () => {
        expect(() => instance.setRegion(1, 0)).toThrow(RangeError);
    });

    it("makes sure the region stays within bounds of the genome", () => {
        instance.setRegion(-1, 100);
        expectRegion(instance, 0, 30);
    });

    it("rounds the arguments", () => {
        instance.setRegion(1.1, 1.9);
        expectRegion(instance, 1, 2);
    });

    it("honors the option to preserve input width", () => {
        instance.setRegion(-5, 10, true);
        expectRegion(instance, 0, 15);

        instance.setRegion(25, 35, true);
        expectRegion(instance, 20, 30);
    })
});

describe("baseToChromosomeIndex()", () => {
    it("returns the right index", () => {
        let results = [
            instance.baseToChromosomeIndex(19), // In genome
            instance.baseToChromosomeIndex(100), // Outside of genome, high number
            instance.baseToChromosomeIndex(-1), // Outside of genome, low number
        ];
        expect(results).toEqual([1,2,0]);
    });
});

describe("getRegionList()", () => {
    it("gets the region properly when zoomed into one chromosome", () => {
        instance.setRegion(10, 19);
        expect(instance.getRegionList()).toEqual([
            {chromosomeName: "chr2", start: 1, end: 10}
        ]);
    });

    it("gets the list of regions properly when zoomed across multiple chromosomes", () => {
        instance.setRegion(4, 24);
        expect(instance.getRegionList()).toEqual([
            {chromosomeName: "chr1", start: 5, end: 10},
            {chromosomeName: "chr2", start: 1, end: 10},
            {chromosomeName: "chr3", start: 1, end: 5},
        ]);
    });
});

describe("pan()", () => {
    it("adds a positive offset to view region", () => {
        instance.setRegion(1, 2);
        instance.pan(1);
        expectRegion(instance, 2, 3);
    });

    it("adds a negative offset to view region", () => {
        instance.setRegion(2, 3);
        instance.pan(-1);
        expectRegion(instance, 1, 2);
    });

    it("does not pan off the genome, and preserves region width", () => {
        instance.setRegion(2, 4);
        instance.pan(-10);
        expectRegion(instance, 0, 2);
    });
});

describe("zoom()", () => {
    it("fails if given a zoom factor 0 or less", () => {
        expect(() => instance.zoom(0)).toThrow(RangeError);
        expect(() => instance.zoom(-1)).toThrow(RangeError);
    });

    it("can zoom in and out", () => {
        instance.setRegion(10, 20);
        instance.zoom(2);
        expectRegion(instance, 5, 25);

        instance.zoom(0.5);
        expectRegion(instance, 10, 20);
    });

    it("can zoom on different focal points", () => {
        instance.setRegion(10, 15);
        instance.zoom(2, 0);
        expectRegion(instance, 10, 20);

        instance.zoom(0.5, 1);
        expectRegion(instance, 15, 20);
    });

    it("stays within the genome when zooming out", () => {
        instance.setRegion(0, 10);
        instance.zoom(2);
        expectRegion(instance, 0, 20);
    });
});