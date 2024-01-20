export const otgStatusTable = new Map([
	[0, 'The trajectory is calculated normally'],
	[1, 'The trajectory has reached its final position'],
	[-1, 'Unclassified error'],
	[-100, 'Error in the input parameter'],
	[-101, 'The trajectory duration exceeds its numerical limits'],
	[-102, 'The trajectory exceeds the given positional limits'],
	[-103, 'The trajectory cannot be phase synchronized'],
	[-104, 'The trajectory is not valid due to a conflict with zero limits'],
	[-110, 'Error during the extremel time calculation (Step 1)'],
	[-111, 'Error during the synchronization calculation (Step 2)']
])
export const kinematicStatusTable = new Map([
	[0, 'The calculation was successful.'],
	[1, 'Kinematics resulted in joint or self collision.'],
	[2, 'Kinematics resulted in a singularity.']
])
