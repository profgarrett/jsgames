// Different consent pages 

const _base = {
	type: 'IfPageTextSchema',
	instruction: 'Click "Next Page" to acknowledge these terms and begin using the website.'
};


const use_consent = {	
	..._base,
	description: `
This website is part of a research project conducted by Nathan Garrett.  I am studying online intelligent tutorial systems, and how they can improve participants' abilities.
By using this website, you consent to the use of submitted data for research purposes.  All of your data will be 
anonymized, and your individual privacy will be maintained in all publications or presentations resulting from this study. 
<br/><br/>
If you have any questions or would like additional information about this research, please contact me at 818.252.5147, Nathan.Garrett@Woodbury.edu. 7500 Glenoaks, Blvd, Burbank, 91510. 
<br/><br/>
The Woodbury Institutional Review Board has approved this project (irb@woodbury.edu).
	`};



const wu_consent = {	
	..._base,
	description: `
You are being asked to participate in a research project conducted by Nathan Garrett. You are being asked because you are enrolled in a course at Woodbury University.
<br/><br/>
PURPOSE:      	The purpose of this study is to gather information on how students use online intelligent tutorial systems.
<br/><br/>
PARTICIPATION:	This waiver allows the use of the data you submitted on the Formula Training website for research purposes.
<br/><br/>
RISKS & BENEFITS:      There are minimal risks associated with this study.
<br/><br/>
COMPENSATION:      You will receive extra credit for allowing the use of your submitted work. Students who do not desire to participate will be able to participate in equivalent options, such as attending a student club event.
<br/><br/>
VOLUNTARY PARTICIPATION:     Please understand that participation is completely voluntary.  Your decision whether or not to participate will in no way affect your current or future relationship with Woodbury, or its faculty, students, or staff.  You have the right to withdraw at any time without penalty.  You also have the right to refuse to answer any question(s) for any reason, without penalty.
<br/><br/>
CONFIDENTIALITY:      Your individual privacy will be maintained in all publications or presentations resulting from this study. 
<br/><br/>
If you have any questions or would like additional information about this research, please contact me at 818.252.5147, Nathan.Garrett@Woodbury.edu. 7500 Glenoaks, Blvd, Burbank, 91510. The Woodbury Institutional Review Board has approved this project (irb@woodbury.edu).
<br/><br/>
I understand the above information and have had all of my questions about participation on this research project answered.  I voluntarily consent to participate in this research.
`};

const amt_consent = {
	..._base,
	description: `
You are asked to participate in a research study conducted by Nathan Garrett, PhD, from Woodbury University. You were selected as a possible participant in this study because you have a high-quality user rating on Amazon Mechanical Turk’s online platform. Your decision to participate in this research study is entirely up to you; please read the following carefully before agreeing to proceed.
<br/><br/>
PURPOSE OF THE STUDY<br/>
This study asks you to interpret data in a series of charts. Its goal is to improve the quality of financial reporting.
<br/><br/>
PROCEDURES<br/>
If you volunteer to participate in this study, we will ask you to do the following: complete a brief demographic survey, and then respond to a series of questions about charts. It should take around 30 minutes to complete.
<br/><br/>
COSTS/RISKS<br/>
There are no risks of participating in this research study.
<br/><br/>
BENEFITS/COMPENSATION<br/>
You will be paid a total of $7.50 for completing this research study. The top 20% of participants (as measured by accuracy) will also receive a bonus of $2.
<br/><br/>
CONFIDENTIALITY AND PROTECTION OF DATA<br/>
Participant data will be carefully safeguarded by the researcher. Any personally-identifiable data you provide for the study will remain confidential, and will be disclosed only with your permission, or as required by law.
<br/><br/>
PARTICIPATION AND RIGHT TO WITHDRAW<br/>
You can choose whether to be in this study or not, and you are not waiving any legal rights through your participation.  If you volunteer to be in this study, you may withdraw your consent at any time and discontinue your participation without penalty.
<br/><br/>
CONTACT INFORMATION<br/>
If you have any questions or concerns about this research study, please feel free to contact Nathan Garrett (Nathan.Garrett@Woodbury.edu, 818.252.5147).  If you have any questions regarding your rights as a research participant, contact the Woodbury University Institutional Review Board, (818) 767-0888, or irb@woodbury.edu.
<br/><br/>
SIGNATURES<br/>
Continuing onto the next section signifies that you have been informed about this project, and that you consent to participate. This indicates that you understand all the information and procedures described above and that any questions have been answered to your satisfaction.
`
};

module.exports = { use_consent, wu_consent, amt_consent };
