module.exports = {
  extends: 'jw397',
  //个性配置可以在这里配置
  rules: {
    "no-eval": 2,
    //禁用未使用的变量
    "no-unused-vars": [2, {
      "vars": "all",
      "args": "none",
      "ignoreRestSiblings": false,
      "varsIgnorePattern": "[initCB_|itemClickCB_|sst]"
    }],
    "quotes": ["error", "single", { "allowTemplateLiterals": true,"avoidEscape": true }],
    "no-extend-native": 1,
    "no-useless-return": 1,
    "no-control-regex": 1,
    "new-cap": ["error", {"newIsCap": false, "properties": false, "capIsNewExceptions": ["Page"]}]
  },
  globals: {

  }
};
