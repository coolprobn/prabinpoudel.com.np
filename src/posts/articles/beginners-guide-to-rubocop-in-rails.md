---
title: "Beginner's Guide to RuboCop in Rails"
date: 2021-08-18
path: /articles/beginners-guide-to-rubocop-in-rails/
excerpt: "RuboCop is a static code analyzer which analyzes the code based on the best practices followed by the Ruby developers around the world and defined on the community Ruby style guide. In this article, we will learn: What is RuboCop? Why use RuboCop? and installing RuboCop in Rails."
image: ../../images/articles/beginners-guide-to-rubocop-in-rails.webp
categories: [articles]
tags: [ruby on rails, rubocop]
toc: true
featured: false
comments: true
---

RuboCop is a static code analyzer which analyzes the code based on the best practices followed by the Ruby developers around the world and defined on the community <a href="https://rubystyle.guide"  target="_blank" rel="noopener">Ruby style guide</a>.

Apart from analyzing the code, it also provides us the feature of automatically formatting the code and fix warnings inside our code.

If you are coming from Javascript background, you may have heard about ESLint.

> RuboCop is ESLint for Ruby

Apart from Ruby, RuboCop also provides gems for implementing rules on various extensions like Rails, Minitest, RSpec, etc.

## Why RuboCop?

It begs the question and curiosity among us, so why do we actually need RuboCop? What's the use of having RuboCop in our projects.

Here are some reasons on why we would want to use RuboCop in our projects:

1. Clean code

   We all want to write clean code that adheres to best practices followed by developers around the world. Best practices comes from experience, it may take some years to know about the language and know the anti-patterns and good patterns to follow if we only rely on ourselves. 

   With RuboCop, we have the advantage of not having the experience because best practices have been bundled as rules and shipped to us inside the "rubocop" gem. RuboCop throws warnings whenever we violate rules configured for best practices and after fixing these issues, our code is most of the time clean and easy to understand.

2. Eases the code review process
   
   The main purpose of code review is to fix logics in the code, or fix security vulnerabilities or discuss the path we took to develop the feature. 
   
   But hey, imagine a situation where we push a code with a typo and reviewer spots that, then comments on it for fixing because obviously no one wants to ship the code with typo to production!

   What's wrong with that? It takes significant time to review the code, and with typo or discussion about best practices in merge requests, we as a developer are wasting a lot of time which could have easily be solved with the help of RuboCop by configuring rules.

   RuboCop makes sure that code with issues never makes it to the merge/pull requests.

3. Best practice is no one size fits all

   Normally best practices means what we like or dislike about the code or pattern we follow when we write the code and it differs for each one of us. If we focus our energy in discussing these practices in the code for every feature, when will we ship features?

   With RuboCop, we can discuss with the team on what best practices should the team follow and disable or enable rules based on the conclusion, hence making everyone happy (well, you can never make everyone happy!).

## Setup RuboCop in Rails

In this article, we will be installing main 'rubocop' gem for implementing rules in Ruby code along with the extension 'rubocop-rails' for Rails specific code.

### Add Gems to Gemfile

Add the following to Gemfile inside the group `:development, :test`

```rb
group :development, :test do
  # enforce rails best practice with rubocop
  gem 'rubocop', '~> 1.18.0', require: false
  gem 'rubocop-performance', '~> 1.11.0', require: false
  gem 'rubocop-rails', '~> 2.11.0', require: false
end
```

_NOTE_: Update gem versions based on what is latest at the time you are installing these gems in our project

We have added the following gems to our Gemfile:

- rubocop: For Ruby code
- rubocop-performance: For code performance related rules
- rubocop-rails: For Rails specific rules

### Install Gems in the Project

1. Install rubocop globally

   `gem install rubocop`

   This will help us in running commands provided by 'rubocop' gem like auto formatting, running rubocop in the project, etc.

2. Install new gems with `bundle install`

### Add Configuration Files

To control (enable/disable) rules, we need to create configuration files for each extension. If there is no file then RuboCop will enable default extensions. I like to have configuration files because it provides flexibility to team.

Let's create configuration files for RuboCop and it's extensions:

```cmd
  $ cd /path/to/our/project
  $ touch .rubocop.yml
  $ touch .rubocop-performance.yml
  $ touch .rubocop-rails.yml
```

### Add Rules to Configuration files

> I also have a blog written specifically for configuration files of RuboCop, you can find it at <a href="https://prabinpoudel.com.np/articles/rubocop-configuration-files-for-rails/"  target="_blank" rel="noopener">RuboCop Configuration Files for Rails</a> if you want more options.

Let's update configuration files and add rules for Ruby and installed extensions.

### Ruby

```yml
# .rubocop.yml

# The behavior of RuboCop can be controlled via the .rubocop.yml
# configuration file. It makes it possible to enable/disable
# certain cops (checks) and to alter their behavior if they accept
# any parameters. The file can be placed either in your home
# directory or in some project directory.
#
# RuboCop will start looking for the configuration file in the directory
# where the inspected file is and continue its way up to the root directory.
#

inherit_from:
  - '.rubocop-performance.yml'
  - '.rubocop-rails.yml'

require:
  - rubocop-performance
  - rubocop-rails

AllCops:
  TargetRubyVersion: 2.7
  TargetRailsVersion: 6.0
  Exclude:
    - '**/db/migrate/*'
    - 'db/schema.rb'
    - '**/Gemfile.lock'
    - '**/Rakefile'
    - '**/rails'
    - '**/vendor/**/*'
    - '**/spec_helper.rb'
    - 'node_modules/**/*'
    - 'bin/*'

###########################################################
###################### RuboCop ############################
###########################################################

# You can find all configuration options for rubocop here: https://docs.rubocop.org/rubocop/cops_bundler.html

###########################################################
####################### Gemspec ###########################
###########################################################

Gemspec/DateAssignment: # (new in 1.10)
  Enabled: true

###########################################################
######################## Layout ###########################
###########################################################

Layout/ClassStructure:
  ExpectedOrder:
    - module_inclusion
    - constants
    - association
    - public_attribute_macros
    - public_delegate
    - macros
    - initializer
    - public_class_methods
    - public_methods
    - protected_attribute_macros
    - protected_methods
    - private_attribute_macros
    - private_delegate
    - private_methods

Layout/EmptyLineAfterMultilineCondition:
  Enabled: true

Layout/EmptyLinesAroundAttributeAccessor:
  Enabled: true

Layout/FirstArrayElementIndentation:
  EnforcedStyle: consistent

Layout/FirstArrayElementLineBreak:
  Enabled: true

Layout/FirstHashElementIndentation:
  EnforcedStyle: consistent

Layout/FirstHashElementLineBreak:
  Enabled: true

Layout/LineEndStringConcatenationIndentation: # (new in 1.18)
  Enabled: true

Layout/LineLength:
  Max: 150
  Exclude:
    - '**/spec/**/*'

Layout/MultilineArrayBraceLayout:
  EnforcedStyle: new_line

Layout/MultilineOperationIndentation:
  EnforcedStyle: indented

Layout/MultilineHashBraceLayout:
  EnforcedStyle: new_line

Layout/MultilineHashKeyLineBreaks:
  Enabled: true

Layout/MultilineMethodCallBraceLayout:
  EnforcedStyle: new_line

Layout/MultilineMethodDefinitionBraceLayout:
  EnforcedStyle: new_line

Layout/SpaceAroundMethodCallOperator:
  Enabled: true

Layout/SpaceBeforeBrackets: # (new in 1.7)
  Enabled: true

Layout/SpaceInLambdaLiteral:
  EnforcedStyle: require_space


###########################################################
######################## Lint #############################
###########################################################

Lint/AmbiguousAssignment: # (new in 1.7)
  Enabled: true

Lint/AmbiguousBlockAssociation:
  Exclude:
    - '**/spec/**/*'

Lint/AssignmentInCondition:
  AllowSafeAssignment: false

Lint/BinaryOperatorWithIdenticalOperands:
  Enabled: true

Lint/DeprecatedConstants: # (new in 1.8)
  Enabled: true

Lint/DeprecatedOpenSSLConstant:
  Enabled: true

Lint/DuplicateBranch: # (new in 1.3)
  Enabled: true

Lint/DuplicateElsifCondition:
  Enabled: true

Lint/DuplicateRegexpCharacterClassElement: # (new in 1.1)
  Enabled: true

Lint/DuplicateRequire:
  Enabled: true

Lint/DuplicateRescueException:
  Enabled: true

Lint/EmptyBlock: # (new in 1.1)
  Enabled: true

Lint/EmptyClass: # (new in 1.3)
  Enabled: true

Lint/EmptyConditionalBody:
  Enabled: true

Lint/EmptyFile:
  Enabled: true

Lint/EmptyInPattern: # (new in 1.16)
  Enabled: true

Lint/FloatComparison:
  Enabled: true

Lint/LambdaWithoutLiteralBlock: # (new in 1.8)
  Enabled: true

Lint/MissingSuper:
  Enabled: true

Lint/MixedRegexpCaptureTypes:
  Enabled: true

Lint/NoReturnInBeginEndBlocks: # (new in 1.2)
  Enabled: true

Lint/NumberConversion:
  Enabled: true

Lint/NumberedParameterAssignment: # (new in 1.9)
  Enabled: true

Lint/OrAssignmentToConstant: # (new in 1.9)
  Enabled: true

Lint/RaiseException:
  Enabled: true

Lint/RedundantDirGlobSort: # (new in 1.8)
  Enabled: true

Lint/SelfAssignment:
  Enabled: true

Lint/SymbolConversion: # (new in 1.9)
  Enabled: true

Lint/ToEnumArguments: # (new in 1.1)
  Enabled: true

Lint/TrailingCommaInAttributeDeclaration:
  Enabled: true

Lint/TripleQuotes: # (new in 1.9)
  Enabled: true

Lint/UnexpectedBlockArity: # (new in 1.5)
  Enabled: true

Lint/UnmodifiedReduceAccumulator: # (new in 1.1)
  Enabled: true

Lint/UnusedBlockArgument:
  IgnoreEmptyBlocks: false

Lint/UnusedMethodArgument:
  IgnoreEmptyMethods: false

Lint/UselessMethodDefinition:
  Enabled: true

###########################################################
######################## Metric ###########################
###########################################################

Metrics/AbcSize:
 Max: 45

Metrics/BlockLength:
  CountComments: false
  Max: 50
  Exclude:
    - '**/spec/**/*'
    - '**/*.rake'
    - '**/factories/**/*'
    - '**/config/routes.rb'

Metrics/ClassLength:
  CountAsOne: ['array', 'hash']
  Max: 150

Metrics/CyclomaticComplexity:
  Max: 10

Metrics/MethodLength:
  CountAsOne: ['array', 'hash']
  Max: 30

Metrics/ModuleLength:
  CountAsOne: ['array', 'hash']
  Max: 250
  Exclude:
    - '**/spec/**/*'

Metrics/PerceivedComplexity:
  Max: 10

###########################################################
######################## Naming ###########################
###########################################################

Naming/InclusiveLanguage: # (new in 1.18)
  Enabled: true

###########################################################
######################## Style ############################
###########################################################

Style/AccessorGrouping:
  Enabled: true

Style/ArgumentsForwarding: # (new in 1.1)
  Enabled: true

Style/ArrayCoercion:
  Enabled: true

Style/AutoResourceCleanup:
  Enabled: true

Style/BisectedAttrAccessor:
  Enabled: true

Style/CaseLikeIf:
  Enabled: true

Style/ClassAndModuleChildren:
  Enabled: false

Style/CollectionCompact: # (new in 1.2)
  Enabled: true

Style/CollectionMethods:
  Enabled: true

Style/CombinableLoops:
  Enabled: true

Style/CommandLiteral:
  EnforcedStyle: percent_x

Style/ConstantVisibility:
  Enabled: true

Style/Documentation:
  Enabled: false

Style/DocumentDynamicEvalDefinition: # (new in 1.1)
  Enabled: true

Style/EndlessMethod: # (new in 1.8)
  Enabled: true

Style/ExplicitBlockArgument:
  Enabled: true

Style/GlobalStdStream:
  Enabled: true

Style/HashConversion: # (new in 1.10)
  Enabled: true

Style/HashEachMethods:
  Enabled: true

Style/HashExcept: # (new in 1.7)
  Enabled: true

Style/HashLikeCase:
  Enabled: true

Style/HashTransformKeys:
  Enabled: true

Style/HashTransformValues:
  Enabled: true

Style/IfWithBooleanLiteralBranches: # (new in 1.9)
  Enabled: true

Style/ImplicitRuntimeError:
  Enabled: true

Style/InlineComment:
  Enabled: true

Style/InPatternThen: # (new in 1.16)
  Enabled: true

Style/IpAddresses:
  Enabled: true

Style/KeywordParametersOrder:
  Enabled: true

Style/MethodCallWithArgsParentheses:
  Enabled: true

Style/MissingElse:
  Enabled: true

Style/MultilineInPatternThen: # (new in 1.16)
  Enabled: true

Style/MultilineMethodSignature:
  Enabled: true

Style/NegatedIfElseCondition: # (new in 1.2)
  Enabled: true

Style/NilLambda: # (new in 1.3)
  Enabled: true

Style/OptionalBooleanParameter:
  Enabled: true

Style/QuotedSymbols: # (new in 1.16)
  Enabled: true

Style/RedundantArgument: # (new in 1.4)
  Enabled: true

Style/RedundantAssignment:
  Enabled: true

Style/RedundantBegin:
  Enabled: true

Style/RedundantFetchBlock:
  Enabled: true

Style/RedundantFileExtensionInRequire:
  Enabled: true

Style/RedundantSelfAssignment:
  Enabled: true

Style/SingleArgumentDig:
  Enabled: true

Style/StringChars: # (new in 1.12)
  Enabled: true

Style/StringConcatenation:
  Enabled: true

Style/SwapValues: # (new in 1.1)
  Enabled: true

```

### Rails

```yml
# .rubocop-rails.yml

###########################################################
#################### RuboCop Rails ########################
###########################################################

# You can find all configuration options for rubocop-rails here: https://docs.rubocop.org/rubocop-rails/cops_rails.html

Rails/ActiveRecordCallbacksOrder:
  Enabled: true

Rails/AddColumnIndex: # (new in 2.11)
  Enabled: true

Rails/AfterCommitOverride:
  Enabled: true

Rails/AttributeDefaultBlockValue: # (new in 2.9)
  Enabled: true

Rails/DefaultScope:
  Enabled: true

Rails/EagerEvaluationLogMessage: # (new in 2.11)
  Enabled: true

Rails/ExpandedDateRange: # (new in 2.11)
  Enabled: true

Rails/FindById:
  Enabled: true

Rails/I18nLocaleAssignment: # (new in 2.11)
  Enabled: true

Rails/Inquiry:
  Enabled: true

Rails/MailerName:
  Enabled: true

Rails/MatchRoute:
  Enabled: true

Rails/NegateInclude:
  Enabled: true

Rails/OrderById:
  Enabled: true

Rails/Pluck:
  Enabled: true

Rails/PluckId:
  Enabled: true

Rails/PluckInWhere:
  Enabled: true

Rails/RenderInline:
  Enabled: true

Rails/RenderPlainText:
  Enabled: true

Rails/SaveBang:
  Enabled: true
  AllowImplicitReturn: false

Rails/ShortI18n:
  Enabled: true

Rails/SquishedSQLHeredocs: # (new in 2.8)
  Enabled: true

Rails/TimeZoneAssignment: # (new in 2.10)
  Enabled: true

Rails/UnusedIgnoredColumns: # (new in 2.11)
  Enabled: true

Rails/WhereEquals: # (new in 2.9)
  Enabled: true

Rails/WhereExists:
  Enabled: true

Rails/WhereNot:
  Enabled: true

```

### Performance

```yml
.rubocop-performance.yml

###########################################################
#################### RuboCop Performance ##################
###########################################################

# You can find all configuration options for rubocop-performance here: https://docs.rubocop.org/rubocop-performance/

Performance/AncestorsInclude: # (new in 1.7)
  Enabled: true

Performance/BigDecimalWithNumericArgument: # (new in 1.7)
  Enabled: true

Performance/BlockGivenWithExplicitBlock: # (new in 1.9)
  Enabled: true

Performance/CollectionLiteralInLoop: # (new in 1.8)
  Enabled: true

Performance/ConstantRegexp: # (new in 1.9)
  Enabled: true

Performance/MapCompact: # (new in 1.11)
  Enabled: true

Performance/MethodObjectAsBlock: # (new in 1.9)
  Enabled: true

Performance/RedundantEqualityComparisonBlock: # (new in 1.10)
  Enabled: true

Performance/RedundantSortBlock: # (new in 1.7)
  Enabled: true

Performance/RedundantSplitRegexpArgument: # (new in 1.10)
  Enabled: true

Performance/RedundantStringChars: # (new in 1.7)
  Enabled: true

Performance/ReverseFirst: # (new in 1.7)
  Enabled: true

Performance/SortReverse: # (new in 1.7)
  Enabled: true

Performance/Squeeze: # (new in 1.7)
  Enabled: true

Performance/StringInclude: # (new in 1.7)
  Enabled: true

Performance/Sum: # (new in 1.8)
  Enabled: true

```

## Run RuboCop

We have the option to run RuboCop on 

- Whole project
- Files inside single folder
- Only on single file

After running commands of RuboCop in the command line, we will be presented with issues found in our code inside the project, which we can then fix manually or also have option to auto correct issues in most cases.

### Whole Project

```cmd
  $ cd /path/to/your/project
  $ rubocop
```

### Files inside single folder

```cmd
  $ rubocop app
```

### Single file

```cmd
  $ rubocop app/models/user.rb
```

### Auto fix warnings

RubCop also provides the feature of auto correcting issues in our code. 

There are a couple of things to keep in mind about auto-correct:

- For some offenses, it is not possible to implement automatic correction.
- Some automatic corrections that are possible have not been implemented yet.
- Some automatic corrections might change (slightly) the semantics of the code, meaning they’d produce code that’s mostly equivalent to the original code, but not 100% equivalent. We call such auto-correct behavior "unsafe"

We can run auto correction with the following command:

```cmd
$ rubocop -a
# or
$ rubocop --auto-correct
# or
$ rubocop -A
# or
$ rubocop --auto-correct-all
```

## Other RuboCop Extensions

RuboCop also has options for implementing rules on other extensions like:

- <a href="https://github.com/rubocop/rubocop-rspec"  target="_blank" rel="noopener">rubocop-rspec</a> For Rspec; a test framework popular for testing Rails code
- <a href="https://github.com/rubocop/rubocop-rake"  target="_blank" rel="noopener">rubocop-rake</a>: A RuboCop plugin for Rake
- <a href="https://github.com/rubocop/rubocop-minitest"  target="_blank" rel="noopener">rubocop-minitest</a>: Another popular testing library for testing Ruby and Rails code

## Style Guide 

RuboCop is based on style guides which helps in maintaining best practices for each extension. If you are curious, you can view and read guidelines from links below:

- <a href="https://rubystyle.guide/"  target="_blank" rel="noopener">Ruby</a>
- <a href="https://rails.rubystyle.guide/"  target="_blank" rel="noopener">Rails</a>
- <a href="https://rspec.rubystyle.guide/"  target="_blank" rel="noopener">RSpec</a>
- <a href="https://minitest.rubystyle.guide/"  target="_blank" rel="noopener">Minitest</a>

## Conclusion

RuboCop is very helpful in maintaining best practices and it's one of the gem that we include in all our project setup here at <a href="https://truemark.com.np"  target="_blank" rel="noopener">Truemark</a>.

One thing to remember with Static Code Analyzers is we have the flexibility to enable and disable rules, hence we should always discuss with the team what to include, why to include and what to disable.

This is the guide I hope I had when I was starting out as a Rails developer. I hope you find it useful!

Happy coding!

## Image Credits

- Cover Image by <a href="https://unsplash.com/@scottwebb?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Scott Webb</a> on <a href="https://unsplash.com/s/photos/security?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>

## References

- <a href="https://docs.rubocop.org/rubocop/1.18/installation.html"  target="_blank" rel="noopener">Official RuboCop Docs</a>
- <a href="https://prabinpoudel.com.np/articles/rubocop-configuration-files-for-rails/"  target="_blank" rel="noopener">RuboCop Configuration Files for Rails</a>
