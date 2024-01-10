README file for stimulus images used in "Facial color is an efficient mechanism to visually transmit emotion", PNAS, 2018

======== Expiriment 3 ===========

Dir: exp_3/

The images in the exp_3/ folder are the same as in each individual emotion folder, but with a unique name. 
Each image is named as, subj_<subject number i>_<Emotion Category j>.png


======== Expiriment 4 ===========

Dir: exp_4/
The data is organized per subject in Compound Emotion Dataset 
The emotion category coding （* are the 6 targets used in the experiment） is as follows:

	2:	Happy*
	3:	Sad*
	4:	Angry*
	5:	Surprised
	6:	Disgusted*
	8:	Happy_surprised
	9:	Happy_disgusted*
	15:	Surprisely_fearful*

Each image is named as, subj_<subject number i>_<AU Emotion code j>_<Color Emotion code k>.png

When k == j, the image is congruent (I_{ij}^+, in the paper).
When k != j, the image is not congruent (I_{ij}^k, in the paper).

Please check the paper for the experimental design. 
