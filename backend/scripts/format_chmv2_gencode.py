# this script takes the file output by add_transcriptClass.py and formats it so mongoimport can read it
from format_gencode_gtf import typeMap

desc = {}
with open('kgXref.txt') as fin:
    # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
    for line in fin:
        t = line.strip().split('\t')
        desc[t[4]] = t[7]
types = {}
with open('catLiftOffGenesV1.bed')  as fin, open('catLiftOffGenesV1.refbed','w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        chrom = t[0]
        start = int(t[1])
        end = int(t[2])
        geneid = t[3]
        cend = t[7]
        if cend == t[6]:
            cend = end
        genetype = t[17]
        gtype = genetype
        if genetype in typeMap:
            gtype = typeMap[genetype]
        symbol = t[12]
        ensgid = t[20].split('.')[0]
        if ensgid in desc:
            description = desc[ensgid]
        else:
            description = ''
        estarts = t[11].rstrip(',').split(',')
        estarts = [int(x) for x in estarts]
        esizes = t[10].rstrip(',').split(',')
        esizes = [int(x) for x in esizes]
        estarts = [x + start for x in estarts]
        eends = [ n+estarts[m] for m,n in enumerate(esizes)]
        estarts = [str(x) for x in estarts]
        eends = [str(x) for x in eends]
        fout.write('{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n'.format(chrom, start, end, t[6], cend, t[5], symbol, t[3], gtype, ','.join(estarts), ','.join(eends), description))
