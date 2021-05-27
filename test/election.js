var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
  it("Initializes with 1 candidate", function () {
    return Election.deployed()
      .then(function (instance) {
        return instance.candidatesCount();
      })
      .then(function (count) {
        assert.equal(count, 1, "Candidate count 1");
      });
  });

  it("Initializes candidate with correct data", function () {
    return Election.deployed()
      .then(function (instance) {
        return instance.candidates(1);
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 1, "Correct candidate id");
        assert.equal(candidate[1], "tashi", "Correct candidate name");
        assert.equal(candidate[2], 0, "Correct vote count");
      });
  });

  it("It allows voters to cast vote", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        candidateId = 1;
        return electionInstance.vote(candidateId, { from: accounts[0] });
      })
      .then(function () {
        return electionInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, "The voter was marked as voted");
        return electionInstance.candidates(candidateId);
      })
      .then(function (candidate) {
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "Increments the candidates vote count");
      });
  });

  it("It throws error for invalid candidates", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.vote(99, { from: accounts[0] });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "must revert the transaction"
        );
        return electionInstance.candidates(candidateId);
      })
      .then(function (candidate) {
        var voteCount = candidate[2];
        assert(voteCount, 0, "candidate did not received any vote");
      });
  });

  it("It does not allow voting more than once", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        electionInstance.vote(1, { from: accounts[2] });
        return electionInstance.vote(1, { from: accounts[2] });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "must revert the transaction"
        );
        return electionInstance.candidates(candidateId);
      })
      .then(function (candidate) {
        var voteCount = candidate[2];
        assert(voteCount, 0, "candidate did not received any vote");
      });
  });
});
