/**
	Berlin Numeracy Test

Source:
	http://unipark.de/uc/Cokely/d578/images/sch_BNT_7_items_.pdf
	http://www.riskliteracy.org/researchers/
	
Refs:
	Cokely, E.T., Galesic, M., Schulz, E., Ghazal, S., & Garcia-Retamero, R. (in press). Measuring
	risk literacy: The Berlin Numeracy Test. Judgment and Decision Making.
**/



const _base = {
	type: 'IfPageNumberAnswerSchema',
	show_feedback_on: false
};


const sns = [
	{	..._base,
		description: `Imagine that we flip a fair coin 1,000 times. 
			What is your best guess about how many times the coin 
			would come up heads in 1,000 flips? `,

	},{	..._base,
		description: `Imagine we are throwing a five-sided die 50 times. 
			On average, out of these 50
			throws how many times would this five-sided die show an odd number (1, 3 or 5)?`,
		// 30

	},{ ..._base,
		description: `Out of 1,000 people in a small town 500 are members of a choir. 
			Out of these 500 members in the choir 100 are men. Out of the 500 
			inhabitants that are not in the choir 300 are men. What is the 
			probability that a randomly drawn man is a member
			of the choir? (please write your answer as a percent)`,
		// .25

	},{ ..._base,
		description: `Imagine we are throwing a loaded die (6 sides). 
			The probability that the die shows a
			6 is twice as high as the probability of each of the other numbers. On average, out of
			these 70 throws, how many times would the die show the number 6? `,
		//20

	},{ ..._base,
		description: `In a forest 20% of mushrooms are red, 50% brown and 30% white. A red
			mushroom is poisonous with a probability of 20%. A mushroom that is not red is
			poisonous with probability of 5%. What is the probability that a poisonous
			mushroom in the forest is red?`,
		//50

	},{ ..._base,
		description: `In ACME PUBLISHING SWEEPSTAKES, the chance of winning a car is 1 in 1,000.
			What percent of tickets to ACME PUBLISHING SWEEPSTAKES win a car?`,
		

	},{ ..._base,
		description: `In the BIG BUCKS LOTTERY, the chance of winning a $10 prize is 1%. What is your
			best guess about how many people would win a $10 prize if 1000 people each buy a
			single ticket to BIG BUCKS?`,
		

	}
];

module.exports = sns;
