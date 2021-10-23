---
title: 'Rubocop Configuration Files for Rails'
date: 2021-05-22
path: /articles/rubocop-configuration-files-for-rails/
excerpt: "Rubocop is a linter for Rails. Rubocop helps in enforcing best practices for Ruby and Rails. It helps in maintaining consistency throughout the project. It also has option for autoformatting the code based on the configurations."
image: ../../images/articles/rubocop-configuration-files-for-rails.webp
categories: [articles]
tags: [rubocop, ruby on rails]
toc: true
featured: false
comments: true
---

> I spent a whole day configuring Rubocop in one of our Rails project. I am here to save your day's worth of time.

Rubocop is a linter for Ruby and Rails Projects. It enforces best practices based on the guidelines outlined in the community <a href="https://rubystyle.guide/" target="_blank">Ruby Style Guide</a>. Apart from reporting the problems discovered in your code, RuboCop can also automatically fix many of them for you.

## Configuration for Rails

This project assumes that you have already setup rubocop in your project and have `.rubocop.yml`.

### Step 1: Add rules to `.rubocop.yml`

```ruby
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
  - '.rubocop-rails.yml'
  - '.rubocop-rspec.yml'

require:
  - rubocop-rails
  - rubocop-rspec

AllCops:
  TargetRubyVersion: 2.7
  TargetRailsVersion: 6.0
  Exclude:
    - '**/db/migrate/*'
    - '**/Gemfile.lock'
    - '**/Rakefile'
    - '**/rails'
    - '**/vendor/**/*'
    - '**/spec_helper.rb'
    - 'node_modules/**/*'
    - 'bin/*'

###########################################################
###################### Rubocop ############################
###########################################################

# You can find all configuration options for rubocop here: https://docs.rubocop.org/rubocop/cops_bundler.html

# ============== Layout =================

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

Layout/SpaceInLambdaLiteral:
  EnforcedStyle: require_space

Lint/AmbiguousBlockAssociation:
  Exclude:
    - '**/spec/**/*'

Lint/AssignmentInCondition:
  AllowSafeAssignment: false

Lint/BinaryOperatorWithIdenticalOperands:
  Enabled: true

Lint/DeprecatedOpenSSLConstant:
  Enabled: true

Lint/DuplicateElsifCondition:
  Enabled: true

Lint/DuplicateRequire:
  Enabled: true

Lint/DuplicateRescueException:
  Enabled: true

Lint/EmptyConditionalBody:
  Enabled: true

Lint/EmptyFile:
  Enabled: true

Lint/FloatComparison:
  Enabled: true

Lint/MissingSuper:
  Enabled: true

Lint/MixedRegexpCaptureTypes:
  Enabled: true

Lint/NumberConversion:
  Enabled: true

Lint/RaiseException:
  Enabled: true

Lint/SelfAssignment:
  Enabled: true

Lint/TrailingCommaInAttributeDeclaration:
  Enabled: true

Lint/UnusedBlockArgument:
  IgnoreEmptyBlocks: false

Lint/UnusedMethodArgument:
  IgnoreEmptyMethods: false

Lint/UselessMethodDefinition:
  Enabled: true

# ============== Metric =================

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

# ============== Variable ==================

# Most of the Naming configurations are enabled by default, we should enable or disable configuration depending on what the team needs

### Example
##
#  Naming/VariableNumber:
#    Enabled: false
##
###

# ============== Style ================

Style/AccessorGrouping:
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

Style/ExplicitBlockArgument:
  Enabled: true

Style/GlobalStdStream:
  Enabled: true

Style/HashEachMethods:
  Enabled: true

Style/HashLikeCase:
  Enabled: true

Style/HashTransformKeys:
  Enabled: true

Style/HashTransformValues:
  Enabled: true

Style/ImplicitRuntimeError:
  Enabled: true

Style/InlineComment:
  Enabled: true

Style/IpAddresses:
  Enabled: true

Style/KeywordParametersOrder:
  Enabled: true

Style/MethodCallWithArgsParentheses:
  Enabled: true

Style/MissingElse:
  Enabled: true

Style/MultilineMethodSignature:
  Enabled: true

Style/OptionalBooleanParameter:
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

Style/StringConcatenation:
  Enabled: true

```

### Step 2: Create `.rubocop-rails.yml`

Above file enforces all best practices for Ruby code, now we will be adding configuration explicit for Rails.

Create `.rubocop-rails.yml` if you haven't already and add the following inside it:

```ruby
###########################################################
#################### Rubocop Rails ########################
###########################################################

# You can find all configuration options for rubocop-rails here: https://docs.rubocop.org/rubocop-rails/cops_rails.html

Rails/ActiveRecordCallbacksOrder:
  Enabled: true

Rails/AfterCommitOverride:
  Enabled: true

Rails/DefaultScope:
  Enabled: true

Rails/FindById:
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

Rails/WhereExists:
  Enabled: true

Rails/WhereNot:
  Enabled: true

```

### Bonus: Configuration for RSpec

_NOTE_: You should already have setup the <a href="https://github.com/rubocop/rubocop-rspec" target="_blank">rubocop-rspec</a> gem.

Create `.rubocop-rspec.yml` in the root project and add the following:

```ruby
###########################################################
#################### Rubocop Rspec ########################
###########################################################

# You can find all configuration options for rubocop-rspec here: https://docs.rubocop.org/rubocop-rspec/cops.html

RSpec/AnyInstance:
  Enabled: false

RSpec/BeforeAfterAll:
  Enabled: false

RSpec/ContextWording:
  Enabled: false

RSpec/DescribeClass:
  Enabled: false

RSpec/ExampleLength:
  Enabled: false

RSpec/ExpectInHook:
  Enabled: false

RSpec/FilePath:
  Enabled: false

RSpec/InstanceVariable:
  Enabled: false

RSpec/LetSetup:
  Enabled: false

RSpec/MessageChain:
  Enabled: false

RSpec/MessageSpies:
  Enabled: false

RSpec/MultipleExpectations:
  Enabled: false

RSpec/NamedSubject:
  Enabled: false

RSpec/NestedGroups:
  Max: 7

RSpec/SubjectStub:
  Enabled: false

RSpec/VerifiedDoubles:
  Enabled: false

RSpec/VoidExpect:
  Enabled: false

```

## Conclusion

You should now have fully working configuration for Rubocop in your Rails application in like 2 minutes.

Please note that, these Rubcop rules are not hard-and-fast, you should add and remove rules from the configuration files based on the decisions of your team.

Thank you for reading, see you in the next blog.

**Image Credits:** Cover Image by <a href="https://unsplash.com/@punttim?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Tim Gouw</a> on <a href="https://unsplash.com/s/photos/rules?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  