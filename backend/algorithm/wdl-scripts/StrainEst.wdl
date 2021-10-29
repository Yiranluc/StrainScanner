# This method identifies the strain and its relative abundance in the sample data downloaded from Sequence Read Archive (SRA).
# This method first uses the specified run accession number (as input) to download the data from SRA with sratoolkit (https://ncbi.github.io/sra-tools/install_config.html).
# And then run StrainEst on the downloaded sample data with the specified reference species (as input) (https://github.com/compmetagen/strainest).
# The outputs of the strain estimation will be in the output files, response1 to response5.

workflow StrainEst {
  String accession
  String referenceSpecies
  String routeToReference
  Boolean single
  if (single) {
  	call DownloadDataSingleOutput {
  		input: accession = accession
  	}
    call StrainEstSingle {
    	input: reads1 = DownloadDataSingleOutput.reads1, referenceSpecies = referenceSpecies, routeToReference = routeToReference
  	}
  }
  if (!single) {
  	call DownloadDataPairedOutput {
  		input: accession = accession
  	}
    call StrainEstPaired {
    	input: reads1 = DownloadDataPairedOutput.reads1, reads2 = DownloadDataPairedOutput.reads2, referenceSpecies = referenceSpecies, routeToReference = routeToReference
  	}
  }
}

task DownloadDataPairedOutput {
 String accession
  command {

   #Download the data in fastq format from the public database SRA, using sratoolkit
   fasterq-dump ${accession} -p

  }
  runtime {
  	docker: "pegi3s/sratoolkit"
  }
  output {
    File reads1 = "${accession}_1.fastq"
    File reads2 = "${accession}_2.fastq"
  }
}

task DownloadDataSingleOutput {
 String accession
  command {

   #Download the data in fastq format from the public database SRA, using sratoolkit
   fasterq-dump ${accession} -p

  }
  runtime {
  	docker: "pegi3s/sratoolkit"
  }
  output {
    File reads1 = "${accession}.fastq"
  }
}

task StrainEstPaired {
 File reads1
 File reads2
 String referenceSpecies
 String routeToReference
 command {

   # Now the raw reads will be quality trimmed (e.g. using sickle):
   sickle pe -f ${reads1} -r ${reads2} -t sanger -o \
   reads1.trim.fastq -p reads2.trim.fastq -s reads.singles.fastq -q 20

   # Given the species of interest (e.g. E. coli), download and untar the precomputed
   # Bowtie reference database available at ftp://ftp.fmach.it/metagenomics/strainest/ref/ (e.g. ecoli.tar.gz):
   wget ftp://ftp.fmach.it/metagenomics/strainest/ref/${referenceSpecies}.tar.gz
   tar zxvf ${referenceSpecies}.tar.gz

   # align the metagenome against the database:
   bowtie2 --very-fast --no-unal -x ${routeToReference}/bowtie/align -1 reads1.trim.fastq \
   -2 reads2.trim.fastq -S reads.sam

   # sort and index the BAM file:
   samtools view -b reads.sam > reads.bam
   samtools sort reads.bam -o reads.sorted.bam
   samtools index reads.sorted.bam

   # run the strainest est command to predict the strain abundances
   strainest est ${routeToReference}/snp_clust.dgrp reads.sorted.bam outputdir
  }
  runtime {
  	docker: "compmetagen/strainest"
  }
  output {
    File response1 = "outputdir/abund.txt"
    File response2 = "outputdir/max_ident.txt"
    File response3 = "outputdir/info.txt"
    File response4 = "outputdir/counts.txt"
    File response5 = "outputdir/mse.pdf"
  }

}

task StrainEstSingle {
 File reads1
 String referenceSpecies
 String routeToReference
 command {

   # Now the raw reads will be quality trimmed (e.g. using sickle):
   sickle se --fastq-file ${reads1} --qual-type sanger --output-file trimmed_output_file.fastq

   # Given the species of interest (e.g. E. coli), download and untar the precomputed
   # Bowtie reference database available at ftp://ftp.fmach.it/metagenomics/strainest/ref/ (e.g. ecoli.tar.gz):
   wget ftp://ftp.fmach.it/metagenomics/strainest/ref/${referenceSpecies}.tar.gz
   tar zxvf ${referenceSpecies}.tar.gz

   # align the metagenome against the database:
   bowtie2 -x ${routeToReference}/bowtie/align -U trimmed_output_file.fastq --no-unal -p 12 -S reads.sam

   # sort and index the BAM file:
   samtools view -b reads.sam > reads.bam
   samtools sort reads.bam -o reads.sorted.bam
   samtools index reads.sorted.bam

   # run the strainest est command to predict the strain abundances
   strainest est ${routeToReference}/snp_clust.dgrp reads.sorted.bam outputdir
  }
  runtime {
  	docker: "compmetagen/strainest"
  }
  output {
    File response1 = "outputdir/abund.txt"
    File response2 = "outputdir/max_ident.txt"
    File response3 = "outputdir/info.txt"
    File response4 = "outputdir/counts.txt"
    File response5 = "outputdir/mse.pdf"
  }

}
