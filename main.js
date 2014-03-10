'use strict'; // somewhat safer js 
var csv = require('csv');

/* DB schema
caseId	docketId	caseIssuesId	voteId	dateDecision	decisionType	usCite	sctCite	ledCite	lexisCite	term	naturalCourt	chief	docket	caseName	dateArgument	dateRearg	petitioner	petitionerState	respondent	respondentState	jurisdiction	adminAction	adminActionState	threeJudgeFdc	caseOrigin	caseOriginState	caseSource	caseSourceState	lcDisagreement	certReason	lcDisposition	lcDispositionDirection	declarationUncon	caseDisposition	caseDispositionUnusual	partyWinning	precedentAlteration	voteUnclear	issue	issueArea	decisionDirection	decisionDirectionDissent	authorityDecision1	authorityDecision2	lawType	lawSupp	lawMinor	majOpinWriter	majOpinAssigner	splitVote	majVotes	minVotes	justice	justiceName	vote	opinion	direction	majority	firstAgreement	secondAgreement
*/

// utility to make lookup by column letter easy
function colToLine(letter) {
  return (letter.charCodeAt(0) - 'A'.charCodeAt(0));
}

csv().from.path(__dirname + '/SCDBX.csv', {delimiter: ',', escape: '""'})
.to.array(function(data) {
  var DB = data;
  console.log(DB.length);
  //console.log(DB[1]);
  
  function test(line) {return line[colToLine('J')].indexOf('2013 U.S.') !== -1}
  var filtered = DB.filter(test);
  console.log(filtered.length);
  console.log(filtered[0]);
  console.log(filtered[filtered.length - 1]);
});