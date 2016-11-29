# frozen_string_literal: true
# rubocop:disable Metrics/MethodLength
class MapExportService
  attr_reader :user, :map
  def initialize(user, map, opts = {})
    @user = user
    @map = map
    @topic_ids = opts[:topic_ids] if opts[:topic_ids]
    @synapse_ids = opts[:synapse_ids] if opts[:synapse_ids]
  end

  def json
    # marshal_dump turns OpenStruct into a Hash
    {
      topics: exportable_topics.map(&:marshal_dump),
      synapses: exportable_synapses.map(&:marshal_dump)
    }
  end

  def csv(options = {})
    CSV.generate(options) do |csv|
      to_spreadsheet.each do |line|
        csv << line
      end
    end
  end

  private

  def topic_headings
    [:id, :name, :metacode, :x, :y, :description, :link, :user, :permission]
  end

  def synapse_headings
    [:topic1, :topic2, :category, :description, :user, :permission]
  end

  def exportable_topics
    visible_topics ||= Pundit.policy_scope!(user, map.topics)
    topic_mappings = Mapping.includes(mappable: [:metacode, :user])
                            .where(mappable: visible_topics, map: map)
    topic_mappings.map do |mapping|
      topic = mapping.mappable
      next nil if topic.nil?
      next nil if @topic_ids && !@topic_ids.include?(topic.id)
      OpenStruct.new(
        id: topic.id,
        name: topic.name,
        metacode: topic.metacode.name,
        x: mapping.xloc,
        y: mapping.yloc,
        description: topic.desc,
        link: topic.link,
        user: topic.user.name,
        permission: topic.permission
      )
    end.compact.uniq(&:id)
  end

  def exportable_synapses
    visible_synapses = Pundit.policy_scope!(user, map.synapses).uniq
    visible_synapses.map do |synapse|
      next nil if synapse.nil?
      next nil if @synapse_ids && !@synapse_ids.include?(synapse.id)
      OpenStruct.new(
        topic1: synapse.topic1_id,
        topic2: synapse.topic2_id,
        category: synapse.category,
        description: synapse.desc,
        user: synapse.user.name,
        permission: synapse.permission
      )
    end.compact
  end

  def to_spreadsheet
    spreadsheet = []
    spreadsheet << ['Topics']
    spreadsheet << topic_headings.map(&:capitalize)
    exportable_topics.each do |topics|
      # convert exportable_topics into an array of arrays
      spreadsheet << topic_headings.map { |h| topics.send(h) }
    end

    spreadsheet << []
    spreadsheet << ['Synapses']
    spreadsheet << synapse_headings.map(&:capitalize)
    exportable_synapses.each do |synapse|
      # convert exportable_synapses into an array of arrays
      spreadsheet << synapse_headings.map { |h| synapse.send(h) }
    end

    spreadsheet
  end
end
# rubocop:disable Metrics/MethodLength
